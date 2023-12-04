const mongoose = require('mongoose');
const Models = require('./models.js');
const express = require('express');
const bodyParser = require('body-parser');

const { Movie, User } = Models; // Destructuring assignment for better readability

const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect('mongodb://localhost:27017/moviedb', connectOptions)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


// Gets the list of all movies

app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movie.find()
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Gets the data about a single movie, by title

app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  const movie = movies.find((m) => m.title === req.params.title);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found.');
  }
});


app.get('/users', passport.authenticate('jwt', { session: false }), function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(200).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});




//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.Username });
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});


// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }
    );

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send('User not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});


// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }
    );

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send('User not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});


// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOneAndDelete({ Username: req.params.Username });

    if (!user) {
      res.status(404).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});


app.listen(8081, () => {
  console.log('Your app is listening on port 8081');
});



