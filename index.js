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

// mongoose.connect('mongodb://localhost:27017/moviedb', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

mongoose.connect(process.env.CONNECTION_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to the best movie search app ever!(Maybe😁)');
});

// applies the jwt authentication to every route, except register 
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a user
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});


// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ Username: req.params.Username });
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
  // Validation logic here for request
  // you can either use a chain of methods like .not().isEmpty()
  // which means "opposite of isEmpty" in plain English "is not empty"
  // or use .isLength({min: 5}) which means
  // minimum value of 5 characters is only allowed
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // CONDITION TO CHECK ADDED HERE
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  // CONDITION ENDS

  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set: {
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
    console.log(err);
    res.status(500).send('Error: ' + err);
  });
});




// Add a movie to a user's list of favorites
app.put('/users/:Username/movies/add/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied!')
  }

  await Users.findOneAndUpdate({ Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true })
      .then((updatedUser) => {
          res.status(201).send('Successfully added the movie to the favorite List!\n' + JSON.stringify({
              Username: updatedUser.Username,
              FavoriteMovies: updatedUser.FavoriteMovies,
          }, null, 2));
      })
      .catch((err) => {
          console.error(err);
          res.status(400).send('Couldn\t add movie to favorites List-Err: ' + err);
      })
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


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});




