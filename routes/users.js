const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');

const User  = require('../models/users');

const userSchema = Joi.object().keys({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
});


const isAuthenticated = (req, res, next)=> {
    //passportjs function
    if(req.isAuthenticated()){
      return next();
    }else{
      req.flash('error', 'Oops looks like you\'re not allowed to go there');
      res.redirect('/');
    }
};

const isNotAuthenticated = (req, res, next)=> {
    //passportjs function
    if(req.isAuthenticated()){
      req.flash('error', 'Oops looks like you\'re not allowed to go there');
      res.redirect('/');
    }else{
      next();
    }
};

router.route('/register')
  .get(isNotAuthenticated,(req, res) => {
    res.render('register');
  })
  .post((req, res, next)=>{

    const result = Joi.validate(req.body, userSchema);

    if(result.error){
      req.flash('error', 'Data is not valid please try again');
      res.redirect('/users/register');
      return;
    }

    //check if the email already exists
    User.findOne({'email': result.value.email}, (err,user)=>{
      if(user){
        req.flash('error', 'Email is already in use');
        res.redirect('/users/register');
        return;
      }else{
        //hash password before saving to DB
        User.hashPassword(result.value.password, (err, hash)=>{
          if(err){
            throw err;
          }
            delete result.value.confirmationPassword;
            result.value.password = hash;

            let newUser = new User({
              method: 'local',
              local: result.value
            });

            newUser.save((err)=>{
              if(err){
                throw new Error("Something bad happened, please try again")
              }
              req.flash('success', 'You may now login.')
              res.redirect('/users/login')
            });

        })
      }

    })

  })

router.route('/login')
  .get(isNotAuthenticated,(req, res) => {
    res.render('login');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/users/galaxy',
    failureRedirect: '/users/login',
    failureFlash: true
  }));

router.route('/galaxy')
  .get(isAuthenticated,(req,res)=>{
    if(req.user.method === 'local'){
      res.render('galaxy',{
        username: req.user.local.username
      });
    }

    if(req.user.method === 'google'){
      res.render('galaxy',{
        username: req.user.google.username
      });
    }


  })

router.route('/logout')
  .get(isAuthenticated,(req,res)=>{
    req.logout();
    req.flash('success', 'Logged out successfully')
    res.redirect('/');
  });

router.route('/auth/google')
  .get(passport.authenticate('google', { scope : ['profile', 'email'] }));

router.route('/auth/google/callback')
  .get(passport.authenticate('google', {
    successRedirect : '/users/galaxy',
    failureRedirect : '/users/login',
    failureFlash: true
  }));

module.exports = router;
