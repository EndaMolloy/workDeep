const express = require('express');
const router = express.Router();
const passport = require('passport');

//LOAD USER'S HOMEPAGE
router.route('/:id')
  .get((req,res)=>{
    const method = req.user.method;

    res.render('galaxy',{
      username: req.user[method].username
    });
  });

  module.exports = router;
