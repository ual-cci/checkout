var __home = __dirname + '/../..';
var __config = __home + '/config/config.json';
var __src = __home + '/src';
var __js = __src + '/js';

var config = require( __config );

var database = require( __js + '/database' );
var Permissions = database.Permissions,
	Users = database.Users;;

var passport = require( 'passport' ),
	LocalStrategy = require( 'passport-local' ).Strategy;

var Authentication = {
	auth: function( app ) {
		// Add support for local authentication
		passport.use( new LocalStrategy( {
			usernameField: 'id',
			passwordField: 'id' // hack
		}, function( barcode, pw, done ) {
				Users.findOne( { barcode: barcode } ).populate( 'printer' ).exec( function( err, user ) {
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
			Users.findById( data._id ).populate( 'printer' ).exec( function( err, user ) {
				if ( user != null ) {
					return done( null, user );
				} else {
					return done( null, false );
				}
			} );
		} );

		// Include support for passport and sessions
		app.use( passport.initialize() );
		app.use( passport.session() );
	},
	loggedIn: function( req ) {
		// Is the user logged in?
		if ( req.isAuthenticated() && req.user != undefined && req.user.type == 'staff' ) {
			return true;
		} else {
			return false;
		}
	},
	isLoggedIn: function( req, res, next ) {
		var status = Authentication.loggedIn( req );
		switch ( status ) {
			case true:
				return next();
			default:
			case false:
				if ( req.method == 'GET' ) req.session.requestedUrl = req.originalUrl;
				req.flash( 'error', "Please login" );
				res.redirect( '/login' );
				return;
		}
	}
}

module.exports = Authentication;
