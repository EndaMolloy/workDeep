const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if(req.isAuthenticated())
    res.redirect('/users/'+req.user._id)
  else
    res.render('landing',{layout: 'landing'});
});

router.get('/login',(req, res) => {
  if(req.isAuthenticated())
    res.redirect('/users/'+req.user._id)
  else
    res.render('login',{layout: 'auth'});
});

router.get('/signup',(req, res) => {
  if(req.isAuthenticated())
    res.redirect('/users/'+req.user._id)
  else
    res.render('signup',{layout: 'auth'});
});


router.get('/reset',(req, res) => {
  if(req.isAuthenticated())
    res.redirect('/users/'+req.user._id)
  else
    res.render('reset', {layout: 'auth'});
})

router.get('/verify',(req,res)=> {
  if(req.isAuthenticated())
    res.redirect('/users/'+req.user._id)
  else
    res.render('verify', {layout: 'auth'})
})

module.exports = router;
