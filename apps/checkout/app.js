var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var auth = require( __js + '/authentication' );

var db = require( __js + '/database' )(),
	Courses = db.Courses,
	Years = db.Years,
	Departments = db.Departments;

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Departments.get( function( err, departments ) {
		Courses.get( function( err, courses ) {
			Years.get( function( err, years ) {
				res.render( 'index', {
					departments: departments,
					courses: courses,
					years: years
				} );
			} );
		} );
	} );
} );

module.exports = function( config ) { return app; };
