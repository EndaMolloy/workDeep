const express = require('express');
const router = express.Router();
const passport = require('passport');

const UsersController = require('../controllers/userController');
const {validateBody, schemas} = require('../helpers/routeHelpers');



router.route('/signup')
  .get((req, res) => {
    if(req.isAuthenticated())
      res.redirect('/galaxy/'+req.user._id)
    else
      res.render('signup',{layout: 'auth'});
  })
  .post(validateBody(schemas.userSchema), UsersController.localSignup);

//VERIFY user email address
router.route('/verify/:token')
  .get(UsersController.verifyToken)


router.route('/signin')
  .get((req,res) => {
    if(req.isAuthenticated())
      res.redirect('/users/'+req.user._id)
    else
      res.render('signin',{layout: 'auth'});
  })
  .post(passport.authenticate('local',{failureRedirect: '/users2/login',failureFlash: true}), UsersController.localSignin);

//User forgotten email route
router.route('/forgot')
  .get((req,res) => {
    res.render('forgot', {layout: 'auth'});
  })
  .post(UsersController.forgotPassword);

//User reset password route
router.route('/reset')
  .get((req, res) => {
    if(req.isAuthenticated())
      res.redirect('/users/'+req.user._id)
    else
      res.render('reset', {layout: 'auth'});
  })
  .post(validateBody(schemas.passwordSchema), UsersController.resetpassword);


router.route('/resetpassword/:token')
  .get(UsersController.validateToken)


//SOCIAL MEDIA ROUTES

//GOOGLE AUTH ROUTES
router.route('/auth/google')
  .get(passport.authenticate('google', { scope : ['profile', 'email'] }));
router.route('/auth/google/callback')
  .get(passport.authenticate('google', {
    failureRedirect : '/users2/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/galaxy/'+req.user._id);
  });

//TWITTER AUTH ROUTES
router.route('/auth/twitter')
  .get(passport.authenticate('twitter'));
router.route('/auth/twitter/callback')
  .get(passport.authenticate('twitter', {
    failureRedirect : '/users2/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/galaxy/'+req.user._id);
  });

//GITHUB AUTH ROUTES
router.route('/auth/github')
  .get(passport.authenticate('github', { scope : ['user:email'] }));
router.route('/auth/github/callback')
  .get(passport.authenticate('github', {
    failureRedirect : '/users2/login',
    failureFlash: true
  }), (req,res)=> {
    res.redirect('/galaxy/'+req.user._id);
  });

//LOGOUT of app
router.route('/logout')
  .get((req,res)=>{
    req.logout();
    req.flash('success', 'Logged out successfully')
    res.redirect('/');
  });


module.exports = router;
