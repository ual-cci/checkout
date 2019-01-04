var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var auth = require( __js + '/authentication' );

var db = require( __js + '/database' )(),
	Courses = db.Courses,
	Years = db.Years,
	Locations = db.Locations;

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Locations.get( function( err, locations ) {
		Courses.get( function( err, courses ) {
			Years.get( function( err, years ) {
				res.render( 'index', {
					locations: locations,
					courses: courses,
					years: years
				} );
			} );
		} );
	} );
} );

module.exports = function( config ) { return app; };
