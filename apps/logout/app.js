const express = require( 'express' );

const auth = require('../../src/js/authentication');
const LogoutController = require('./controller');

const app = express();

app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new LogoutController();
  next();
});

app.get('/', auth.isLoggedIn, (req, res) => {
  req.controller.getRoot(req, res);
});

module.exports = function( config, sio ) {
	return app;
};
