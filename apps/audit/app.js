var __home = __dirname + "/../..";
var __config = __home + '/config/config.json';
var __src = __home + '/src';
var __js = __src + '/js';

var config = require( __config );

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Items = db.Items;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	res.locals.currentModule = 'audit';
	res.render( 'audit' );
} );

module.exports = function( config ) { return app; };
