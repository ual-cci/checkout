const express = require( 'express' );

const auth = require('../../src/js/authentication.js');
const CheckoutController = require('./controller.js');

const app = express();

app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new CheckoutController();
  next();
});

app.get( '/', auth.isLoggedIn, (req, res) => {
  req.controller.getRoot(req, res);
});

module.exports = config => app;
