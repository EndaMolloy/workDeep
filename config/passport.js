const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/users');


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {

    //check if the email already exists
    User.findOne({ 'local.email': email }, (err, user)=> {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'No user with that email.' });
      }
      //check if password is valid
      User.validPassword(password, user.local.password,(err, isValid)=>{
          if(err){
            throw new Error('Something went wrong')
          }else{
            if (!isValid) {
              return done(null, false, { message: 'Incorrect password.' });
            }
              return done(null, user);
          }
      });
    });
  }
));

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: 'http://localhost:5000/users/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done)=> {
    //find the user given the email
    User.findOne({ 'google.googleId': profile.id }, function (err, user) {
      if(err)
        return done(err);

      if(user){
        return done(null, user);
      }else{

        //if new account
        let newUser = new User({
          method: 'google',
          google: {
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.name.givenName
          }
        });

        newUser.save((err)=>{
          if(err){
            done(null, newUser, err.message)
          }

          done(null, newUser)
      })
    };
  });
 }
));
