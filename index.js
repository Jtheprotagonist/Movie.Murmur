const mongoose = require('mongoose');
const Models = require('./models.js');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Movie, User, Users } = Models;
const Movies = Models.Movie;
const { check, validationResult } = require('express-validator');
const config = require('./config');
const saltRounds = 10;

mongoose.connect(process.env.CONNECTION_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');

// Allow requests from localhost:1234
app.use(cors({
  origin: 'http://localhost:1234'
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to the best movie search app ever!(Maybe😁)');
});

app.get('/movies', async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Rest of your routes...

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
