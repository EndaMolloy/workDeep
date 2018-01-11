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

module.exports = router;
