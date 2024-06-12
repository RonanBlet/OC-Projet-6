const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://Blet_Ronan:Tv5pP84vFjW0OHzP@monvieuxgrimoire.uxsdfwi.mongodb.net/?retryWrites=true&w=majority&appName=MonVieuxGrimoire',
    {useNewUrlParser : true,
        useUnifiedTopology:true})
    .then (() => console.log('Connexion a MongoDB Réussie'))
    .catch (() => console.log('Connexion a MongoDB échouée'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
    });
    
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));



module.exports = app;