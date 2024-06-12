const Book = require('../models/book');
const mongoose = require('mongoose');
const fs = require('fs');

///////////////////////           GET              //////////////////////////////

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            if (!books || books.length === 0) {
                console.log('No books found');
                return res.status(404).json({ message: 'Aucun livre trouvé' });
            }
            res.status(200).json(books);
        })
        .catch(error => {
            console.log('Error:', error);
            res.status(400).json({ error });
        });
};

exports.getSingleBook = (req, res, next) => {
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: 'Invalid book ID' });
    }


    Book.findById(bookId)
     .then(book => {
         if(!book){
             return res.status(404).json({message : 'Le livre demandé n éxiste pas'});
         }
         res.status(200).json(book);
     })
     .catch(error => {
         console.error(error);
     })
 };

exports.getBestRating = (req, res, next) => {
    Book.find().sort({averageRating: -1}).limit(3)
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            console.log('Error:', error);
            res.status(400).json({ error });
        });
};

///////////////////////           POST              //////////////////////////////

exports.postNewBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject.userId;

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
        .then(() => {
            res.status(201).json({message:'objet enregistré !'})
        })
        .catch((error) => {res.status(400).json({error})});
};


///////////////////////           DELETE              //////////////////////////////

exports.deleteBook = (req,res,next) => {
    Book.findOne({_id: req.params.id})
        .then(book => {
            if(book.userId != req.auth.userId){
                    res.status(401).json({message : 'non-autorisé'});
                } else {
                    const filename = book.imageUrl.split('/image/')[1];
                    fs.unlink(`image/${filename}`, () => {
                        Book.deleteOne({_id: req.params.id})
                            .then(() => res.status(200).json({message: 'Livre supprimé !'}))
                            .catch(error => res.status(401).json({error}));
                    });
                }
        })
        .catch(error => {
            res.status(500).json({error});
        });
};

///////////////////////           PUT              //////////////////////////////

exports.updateBook = (req,res,next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};

        if(req.file){
            Book.findById(req.params.id)
                .then(book => {
                    if(!book){
                        return res.status(404).json({error : 'Livre non trouvé'});
                    }
                    const filename = book.imageUrl.split('/image/')[1];
                    fs.unlink(`image/${filename}`, () => {
                        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
                            .then(() => res.status(200).json({message: 'Livre mis a jour !'}))
                            .catch(error => res.status(400).json({error}));
                    });
                })
                .catch(error => res.status(500).json({error}));
        }
        else {
            Book.updateOne({_id:req.params.id},{...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message: 'Livre mis à jour !'}))
                .catch(error => res.status(400).json({error}));
        }

};