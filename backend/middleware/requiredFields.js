const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);

    const {title, author, year, genre} = bookObject;

    if (!title || !author || !year || !genre)
        {
            if (req.file) {
                fs.unlinkSync(req.file.path); 
            }
            return res.status(400).json({message: 'Champ(s) invalide(s)'});
        } else {
            next();
        }
        
};