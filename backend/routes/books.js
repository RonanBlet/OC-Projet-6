const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const bookCtrl = require('../controllers/books');


router.get('/', bookCtrl.getAllBooks);

router.get('/bestrating', bookCtrl.getBestRating);

router.get('/:id', bookCtrl.getSingleBook);

router.post('/', auth , multer , bookCtrl.postNewBook);

router.post('/:id/rating', auth, bookCtrl.bookRating);

router.delete('/:id', auth, multer, bookCtrl.deleteBook );

router.put('/:id', auth , multer , bookCtrl.updateBook);



module.exports = router;