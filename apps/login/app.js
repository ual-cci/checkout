const express = require( 'express' );
const passport = require('@passport-next/passport');

const LoginController = require('./controller');

const app = express();

app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new LoginController();
  next();
});

app.get('/', (req, res) => {
  req.controller.getRoot(req, res);
});

const passportAuth = passport.authenticate('local', {
	failureRedirect: '/login',
	successRedirect: '/checkout',
	failureFlash: true,
	successFlash: true
});

app.post('/', passportAuth, (req, res) => {
  req.controller.postRoot(req, res);
});

module.exports = config => app;
