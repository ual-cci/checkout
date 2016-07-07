var config = require( './config.json' );
var mongoose = require( 'mongoose' ),
	courses = require( __dirname + '/apps/courses' ),
	users = require( __dirname + '/apps/users' ),
	departments = require( __dirname + '/apps/departments' ),
	items = require( __dirname + '/apps/items' ),
	groups = require( __dirname + '/apps/groups' ),
	reports = require( __dirname + '/apps/reports' ),
	checkout = require( __dirname + '/apps/checkout' );
var	express = require( 'express' ),
	flash = require( 'express-flash' ),
	add_flash = require( 'add-flash' ),
	session = require( 'express-session' ),
	body = require('body-parser'),
	cookie = require('cookie-parser'),
	swig = require( 'swig' );
var app = express(),
	http = require( 'http' ).Server( app )
	io = require( __dirname + '/apps/socket' )( http );

// Connect to Mongo
mongoose.connect( config.mongo );

var Users = require( __dirname + '/models/users' );

app.use( express.static( __dirname + '/static' ) );
app.use( body.json() );
app.use( body.urlencoded( { extended: true } ) );
app.use( cookie() );
var sessionMiddleware = session( {
	secret: config.secret,
	cookie: { maxAge: 31*24*60*60*1000 },
	saveUninitialized: false,
	resave: false,
	rolling: true
} );
app.use( sessionMiddleware );
io.use( function( socket, next ) {
    sessionMiddleware( socket.request, socket.request.res, next );
} );
app.use( flash() );
app.use( add_flash() );

// Configure Swig
app.engine( 'swig', swig.renderFile );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'swig' );
app.set( 'view cache', false );
swig.setDefaults( { cache: false } );

app.use( function( req, res, next ) {
	if ( config.dev ) res.locals.dev = true;
	res.locals.loggedInUser = req.session.user;
	next();
} );

app.use( courses.path, courses );
app.use( users.path, users );
app.use( departments.path, departments );
app.use( items.path, items );
app.use( groups.path, groups );
app.use( reports.path, reports );
app.use( checkout.path, checkout );

// Handle Index
app.get( '/', function ( req, res ) {
	if ( req.session.user ) {
		res.redirect( '/checkout' );
	} else {
		res.redirect( '/login' );
	}
} );

// Handle Index
app.get( '/login', function ( req, res ) {
	res.render( 'login' );
} );

// Handle Index
app.post( '/login', function ( req, res ) {
	Users.findOne( { barcode: req.body.id }, function( err, user ) {
		if ( user && ( user.type == 'staff' || user.type == 'admin' ) ) {
			var loggedInUser = {
				id: user._id,
				name: user.name,
				isStaff: user.type == 'staff' ? true : false
			}
			req.session.user = loggedInUser;
			res.redirect( req.session.requested ? req.session.requested : '/checkout' );
			req.session.requested = '';
		} else {
			req.add_flash( 'danger', 'Invalid user' );
			res.redirect( '/login' );
		}
	} )
} );

// Handle logout
app.get( '/logout', function ( req, res ) {
	req.session.destroy();
	res.redirect( '/' );
} );

// Start server
http.listen( config.port, function() {
	console.log( 'Server started.' );
} );
