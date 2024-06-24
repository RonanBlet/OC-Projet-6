const Book = require('../models/book');
const mongoose = require('mongoose');
const fs = require('fs');
const fse = require('fs-extra');
const sharp = require('sharp');
const path = require('path');


///////////////////////           GET              //////////////////////////////

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            if (!books || books.length === 0) {
                return res.status(404).json({ message: 'Aucun livre trouvé' });
            }
            res.status(200).json(books);
        })
        .catch(error => {
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
         res.status(500).json({error});
     });
 };

exports.getBestRating = (req, res, next) => {
    Book.find().sort({averageRating: -1}).limit(3)
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            res.status(400).json({ error });
        });
};

///////////////////////           POST              //////////////////////////////

exports.postNewBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);

    const originalFilePath = req.file.path;
    const tempFilePath = path.join('images', 'temp_' + req.file.filename);
    const finalFileName = req.file.filename.split('.').slice(0, -1).join('.') + '.webp';
    const finalFilePath = path.join('images', finalFileName);
    
    sharp(originalFilePath)
        .resize(206, 260)
        .toFormat('webp')
        .toFile(tempFilePath)
        .then(() => {
            return fse.move(tempFilePath, finalFilePath, { overwrite: true });
        })
        .then(() => {
            if (originalFilePath !== finalFilePath) {
                fs.unlinkSync(originalFilePath);
            }

            const book = new Book({
                ...bookObject,
                userId: req.auth.userId,
                imageUrl: `${req.protocol}://${req.get('host')}/images/${finalFileName}`
            });

            if (book.ratings[0].grade == 0) {
                book.averageRating = 0;
                book.ratings = [];
            }

            return book.save();
        })
        .then(() => {
            res.status(201).json({ message: 'Objet enregistré et image compressée !' });
        })
        .catch((error) => {
            console.error('Erreur lors de la création du livre:', error);
            res.status(400).json({ error });
        });
};

exports.bookRating = (req,res,next) => {
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: 'Invalid book ID' });
    }

    const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };

    Book.findById(bookId)
        .then(book => {
            if(!book){
                return res.status(404).json({message:'Book not found'});
            }

            const existingRating = book.ratings.findIndex(rating => rating.userId === req.auth.userId);

            if(existingRating !== -1){
                book.ratings[existingRating].grade = newRating.grade;
            } else {
                book.ratings.push(newRating);
            }

            const allRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            book.averageRating = parseFloat((allRatings / book.ratings.length).toFixed(1));
            //book.averageRating = Math.round(allRatings / book.ratings.length); //pas de chiffre après la virgule

            return book.save();
        })
        .then(newBook => res.status(200).json(newBook))
        .catch(error => res.status(500).json({error}));
    
 
};


///////////////////////           DELETE              //////////////////////////////

exports.deleteBook = (req,res,next) => {
    Book.findOne({_id: req.params.id})
        .then(book => {
            if(!book){
                return res.status(404).json({message : 'livre non trouvé'});
            }

            if(book.userId != req.auth.userId){
                res.status(401).json({message : 'non-autorisé'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if(err){
                        return res.status(500).json({error: 'Erreur lors de la suppression du fichier'});
                    }
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
                    const filename = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
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