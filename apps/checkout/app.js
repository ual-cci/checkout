var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var auth = require( __js + '/authentication' );

var db = require( __js + '/database' ),
	Departments = db.Departments;

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Departments.find( function( err, departments ) {
		res.render( 'index', {
			departments: departments
		} );
	} );
} );

module.exports = function( config ) { return app; };
