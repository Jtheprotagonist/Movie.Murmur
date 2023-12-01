const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/moviedb', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Array for Movies
let movies = [
  {
    id: 1,
    title: 'Movie 1',
    description: 'Description of Movie 1',
    genre: 'Genre 1',
    director: 'Director 1',
    imageUrl: 'URL 1',
    featured: true,
  },
  {
    id: 2,
    title: 'Movie 2',
    description: 'Description of Movie 2',
    genre: 'Genre 2',
    director: 'Director 2',
    imageUrl: 'URL 2',
    featured: false,
  },
  // Add more movie objects as needed
];

// Array for Users
let users = [
  {
    id: 1,
    email: 'user1@example.com',
    favorites: [1, 3], // Movie IDs of their favorite movies
  },
  {
    id: 2,
    email: 'user2@example.com',
    favorites: [2, 4],
  },
  // Add more user objects as needed
];

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Gets the list of all movies

app.get('/movies', (req, res) => {
  res.json(movies);
});

// Gets the data about a single movie, by title

app.get('/movies/:title', (req, res) => {
  const movie = movies.find((m) => m.title === req.params.title);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found.');
  }
});

app.get('/users', function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(200).json(users);  // Change status to 200 for success
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
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Delete a user by username
app.delete('/users/:Username', async (req, res) => {
  try {
    const user = await Users.findOneAndDelete({ Username: req.params.Username });
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found');
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



