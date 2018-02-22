const express = require('express');
const router = express.Router();
const {isNotAuthenticated} = require('../helpers/routeHelpers');

router.get('/', isNotAuthenticated, (req, res) => {
  res.render('landing',{layout: 'landing'})
});

module.exports = router;
