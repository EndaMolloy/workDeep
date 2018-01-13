const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('landing',{layout: 'landing'});
});

router.get('/login',(req, res) => {
    res.render('login',{layout: 'auth'});
});

router.get('/signup',(req, res) => {
    res.render('signup',{layout: 'auth'});
});

router.get('/forgot',(req, res) => {
    res.render('forgot', {layout: 'auth'});
})

router.get('/reset',(req, res) => {
    res.render('reset', {layout: 'auth'});
})

router.get('/verify',(req,res)=> {
    res.render('verify', {layout: 'auth'})
})

module.exports = router;
