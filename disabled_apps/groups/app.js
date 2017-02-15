var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Items = db.Items,
	Groups = db.Groups,
	Departments = db.Departments,
	Users = db.Users,
	Courses = db.Courses;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	res.sendStatus( 200 );
} );

module.exports = function( config ) { return app; };
