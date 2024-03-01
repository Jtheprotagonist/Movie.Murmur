const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Models = require('./models.js');
const { Movie } = Models;

// Replace <password> with your actual password
const mongoURI = 'mongodb+srv://User1:Oxonhill15@cluster0.dlxbnnp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:63239'
  }));

// Define routes
app.get('/', (req, res) => {
    res.send('Welcome to the best movie search app ever! (Maybe😁)');
});

app.get('/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add more routes as needed

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
