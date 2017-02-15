var config = require( './config/config.json' );

var mongoose = require( 'mongoose' ),
	Users = require( __dirname + '/models/users' );

mongoose.connect( config.mongo );

var	express = require( 'express' ),
	flash = require( 'express-flash' ),
	add_flash = require( 'add-flash' ),
	body = require('body-parser'),
	cookie = require('cookie-parser'),
	swig = require( 'swig' );

var app = express(),
	http = require( 'http' ).Server( app )
	io = require( __dirname + '/apps/socket' )( http ),
	courses = require( __dirname + '/apps/courses' ),
	users = require( __dirname + '/apps/users' ),
	departments = require( __dirname + '/apps/departments' ),
	items = require( __dirname + '/apps/items' ),
	groups = require( __dirname + '/apps/groups' ),
	reports = require( __dirname + '/apps/reports' ),
	checkout = require( __dirname + '/apps/checkout' );

var passport = require( 'passport' ),
	passportSocketIo = require('passport.socketio'),
	LocalStrategy = require( 'passport-local' ).Strategy;

var session = require( 'express-session' ),
	MongoDBStore = require( 'connect-mongodb-session' )( session );

var store = new MongoDBStore( {
	uri: config.mongo,
	collection: 'sessionStore'
} );
store.on( 'error', function( error ) {
	console.log( error );
} );

app.use( body.json() );
app.use( body.urlencoded( { extended: true } ) );

app.use( cookie() );
var sessionMiddleware = session( {
	secret: config.secret,
	cookie: { maxAge: 31*24*60*60*1000 },
	store: store,
	saveUninitialized: true,
	resave: true
} );
app.use( sessionMiddleware );

app.use( passport.initialize() );
app.use( passport.session() );

io.use( passportSocketIo.authorize( {
	key: 'connect.sid',
	secret: config.secret,
	store: store,
	passport: passport,
	cookieParser: cookie
} ) );



app.use( flash() );
app.use( add_flash() );

app.engine( 'swig', swig.renderFile );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'swig' );
app.set( 'view cache', false );
swig.setDefaults( { cache: false } );

app.use( function( req, res, next ) {
	if ( config.dev ) res.locals.dev = true;
	res.locals.loggedInUser = req.user;
	next();
} );

app.use( express.static( __dirname + '/static' ) );
app.use( courses.path, courses );
app.use( users.path, users );
app.use( departments.path, departments );
app.use( items.path, items );
app.use( groups.path, groups );
app.use( reports.path, reports );
app.use( checkout.path, checkout );

// Handle Index
app.get( '/', function ( req, res ) {
	if ( req.isAuthenticated() ) {
		res.redirect( '/checkout' );
	} else {
		res.redirect( '/login' );
	}
} );

// Handle Index
app.get( '/login', function ( req, res ) {
	if ( req.isAuthenticated() ) {
		res.redirect( '/checkout' );
	} else {
		res.render( 'login' );
	}
} );

app.post( '/login', passport.authenticate( 'local', {
	failureRedirect: '/',
	failureFlash: true,
	successFlash: true
} ), function ( req, res ) {
	if ( req.session.requested != undefined ) {
		res.redirect( req.session.requested );
		delete req.session.requested;
	} else {
		res.redirect( '/checkout' );
	}
} );

// Handle logout
app.get( '/logout', function ( req, res ) {
	passportSocketIo.filterSocketsByUser( io, function( user ) {
		if ( user._id == undefined || req.user._id == undefined )
			return false;

		return user._id.toString() == req.user._id.toString();
	} ).forEach( function( socket ) {
		socket.request.user = null;
		socket.emit( 'loggedout' );
	} );
	req.logout();
	res.redirect( '/' );
} );

// Start server
http.listen( config.port, function() {
	console.log( 'Server started.' );
} );

passport.use( new LocalStrategy( {
	usernameField: 'id',
	passwordField: 'id' // hack
}, function( barcode, pw, done ) {
		Users.findOne( { barcode: barcode }, function( err, user ) {
			if ( user && ( user.type == 'staff' ) ) {
				return done( null, user );
			} else {
				return done( null, false );
			}
		} );
	}
) );

passport.serializeUser( function( data, done ) {
	done( null, data );
} );

passport.deserializeUser( function( data, done ) {
	Users.findById( data._id, function( err, user ) {
		if ( user != null ) {
			return done( null, user );
		} else {
			return done( null, false );
		}
	} );
} );
