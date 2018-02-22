const express = require('express');
const router = express.Router();
const passport = require('passport');

const UsersController = require('../controllers/userController');
const {validateBody, schemas, isAuthenticated, isNotAuthenticated} = require('../helpers/routeHelpers');


//User signup route
router.route('/signup')
  .get(isNotAuthenticated, (req, res) => {res.render('signup',{layout: 'auth'})})
  .post(validateBody(schemas.userSchema, 'user'), UsersController.localSignup);

//Verify user email address
router.route('/verify/:token')
  .get(UsersController.verifyToken)

//User sigin route
router.route('/signin')
  .get(isNotAuthenticated, (req,res) => {res.render('signin',{layout: 'auth'})})
  .post(passport.authenticate('local',{failureRedirect: '/users/login',failureFlash: true}), UsersController.signin);

//User forgotten email route
router.route('/forgot')
  .get(isNotAuthenticated, (req,res) => {res.render('forgot', {layout: 'auth'})})
  .post(UsersController.forgotPassword);

//User reset password route
router.route('/reset')
  .get(isNotAuthenticated, (req, res) => {res.render('reset', {layout: 'auth'})})

//Validate user reset password token
router.route('/resetpassword/:token')
  .get(UsersController.validateToken)
  .post(validateBody(schemas.passwordSchema, 'password'), UsersController.resetpassword);

//LOGOUT of user session
router.route('/logout')
  .get(isAuthenticated, UsersController.logout);



//SOCIAL MEDIA ROUTES

//GOOGLE AUTH ROUTES
router.route('/auth/google')
  .get(passport.authenticate('google', { scope : ['profile', 'email'] }));
router.route('/auth/google/callback')
  .get(passport.authenticate('google', { failureRedirect : '/users/login', failureFlash: true }), UsersController.signin);

//TWITTER AUTH ROUTES
router.route('/auth/twitter')
  .get(passport.authenticate('twitter'));
router.route('/auth/twitter/callback')
  .get(passport.authenticate('twitter', { failureRedirect : '/users/login', failureFlash: true }), UsersController.signin);


//GITHUB AUTH ROUTES
router.route('/auth/github')
  .get(passport.authenticate('github', { scope : ['user:email'] }));
router.route('/auth/github/callback')
  .get(passport.authenticate('github', { failureRedirect : '/users/login', failureFlash: true }), UsersController.signin);



module.exports = router;
