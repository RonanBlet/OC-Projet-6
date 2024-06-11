const express = require('express');
const mongoose = require('mongoose');
const Thing = require('./models/thing');

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

  app.get('/api/books', (req, res, next) => {
    Thing.find()
        .then(things => {
            console.log('Books retrieved:', things);
            if (!things || things.length === 0) {
                console.log('No books found');
                return res.status(404).json({ message: 'Aucun livre trouvé' });
            }
            res.status(200).json(things);
        })
        .catch(error => {
            console.log('Error:', error);
            res.status(400).json({ error });
        });
});

module.exports = app;