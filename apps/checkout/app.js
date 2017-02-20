var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	res.render( 'compact-checkout' );
} );

app.get( '/expand', auth.isLoggedIn, function( req, res ) {
	res.render( 'checkout' );
} );

module.exports = function( config ) { return app; };
