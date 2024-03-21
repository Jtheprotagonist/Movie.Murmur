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
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Import dependencies for JWT authentication
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');

// Configure Passport to use JWT authentication
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
}, (jwtPayload, done) => {
  Users.findById(jwtPayload._id)
    .then(user => {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch(err => done(err, false));
}));

// Protected movies endpoint using Passport authentication middleware
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
      .then((movies) => {
          res.status(200).json(movies);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('An Error occurred: ' + err);
      })
});

// Add more routes as needed

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
