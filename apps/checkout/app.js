var	express = require( 'express' );

const auth = require('../../src/js/authentication.js');
const config = require('./config.json');
const CheckoutController = require('./controller.js');

const app = express();
const controller = new CheckoutController(['/', config.path].join(''));

app.set( 'views', __dirname + '/views' );
app.get( '/', auth.isLoggedIn, (req, res) => {
  controller.getHome(req, res);
});

module.exports = function( config ) { return app; };
