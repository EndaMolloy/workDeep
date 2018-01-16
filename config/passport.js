const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/users');

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async(email, password, done)=> {

    try{
      //check if the email already exists
      const user = await User.findOne({ 'local.email': email });

      if (!user) {
        return done(null, false, { message: 'No user with that email.' });
      }

      //check if password is valid
      const isValid = await User.validPassword(password, user.local.password);

      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      //check if the account has been verified
      if(!user.local.active){
        return done(null, false, {message: 'Please verify your email before logging in.'})
      }
        return done(null, user);
    }

    catch(err){
      next(err);
    }
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
  async (accessToken, refreshToken, profile, done)=> {

    try{
      //find the user given the id
      const user = await User.findOne({ 'google.googleId': profile.id });

      if(user){
        return done(null, user);
      }
      //if new account, create new user
      const newUser = await new User({
        method: 'google',
        google: {
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.name.givenName
        }
      });

      await newUser.save();
      done(null, newUser);

    }catch(err){
      return done(err, false, err.message)
    }
  }
));

//Use the GithubStrategy within Passport.
passport.use('github', new GithubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: 'http://localhost:5000/users/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) =>{
    try{

      //find the user given the email
      const user = await User.findOne({ 'github.githubId': profile.id });

      if(user){
        return done(null, user);
      }

      //if new account, create new user
      const newUser = await new User({
       method: 'github',
       github: {
       githubId: profile.id,
       username: profile.displayName
      }
      });

      await newUser.save();

      done(null, newUser);
    }
    catch(err){
      return done(err, false, err.message)
    }
  }
));

//Use the TwitterStrategy within Passport
passport.use('twitter', new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:5000/users/auth/twitter/callback"
  },
  async (accessToken, refreshToken, profile, done) =>{
    try{
      console.log(profile);
      //find the user given the email
      const user = await User.findOne({ 'twitter.twitterId': profile.id });

      if(user){
        return done(null, user);
      }

      //if new account, create new user
      const newUser = await new User({
       method: 'twitter',
       twitter: {
       twitterId: profile.id,
       username: getFirstName(profile.displayName)
      }
      });

      await newUser.save();

      done(null, newUser);
    }
    catch(err){
      return done(err, false, err.message)
    }
  }
));

//Twitter display Name is in the format "Joe Bloggs"
//Fucntion to extract the first name entered
function getFirstName(displayName){
  const names = displayName.split(" ");
  return names[0];
}
