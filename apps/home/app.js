var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var auth = require( __js + '/authentication' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	res.redirect( '/checkout' );
} );

module.exports = function( config ) { return app; };
