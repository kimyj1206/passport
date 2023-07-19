const { checkNotAuthenticated, checkAuthenticated } = require('../middleware/auth');
const express = require('express');
const mainRouter = express.Router();

mainRouter.get('/', checkAuthenticated, (req, res) => {
  res.render('index');
  // throw new Error('우사기에게 털렸다~~~울라~~이얏하~~');
});

mainRouter.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

mainRouter.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('signup');
});

module.exports = mainRouter;