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

var crypto = require( 'crypto' );

var Authentication = {
	auth: function( app ) {
		// Add support for local authentication
		passport.use(
			new LocalStrategy( function( email, password, done ) {
				Users.findOne( { email: email } ).populate( 'printer' ).exec( function( err, user ) {
					if ( user ) {
						if ( user.type == 'staff' && ! user.disable ) {

							// Hash the entered password with the users salt
							Authentication.hashPassword( password, user.password.salt, user.password.iterations, function( hash ) {

								// Check the hashes match
								if ( hash == user.password.hash ) {
									return done( null, { _id: user._id } );
								}

								// Delay by 1 second to slow down password guessing
								return setTimeout( function() { return done( null, false, { message: 'Invalid login' } ); }, 1000 );
							} );
						} else {
							return done( null, false );
						}
					} else {
						// If email address doesn't match
						// Delay by 1 second to slow down password guessing
						return setTimeout( function() { return done( null, false, { message: 'Invalid login' } ); }, 1000 );
					}
				} );
			}
		) );

		// Passport.js serialise user function
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

	// Used to create a long salt for each individual user
	// returns a 256 byte / 512 character hex string
	generateSalt: function( callback ) {
		crypto.randomBytes( 256, function( ex, salt ) {
			callback( salt.toString( 'hex' ) );
		} );
	},

	// Hashes passwords through sha512 1000 times
	// returns a 512 byte / 1024 character hex string
	hashPassword: function( password, salt, iterations, callback ) {
		crypto.pbkdf2( password, salt, iterations, 512, 'sha512', function( err, hash ) {
			callback( hash.toString( 'hex' ) );
		} );
	},

	// Utility function generates a salt and hash from a plain text password
	generatePassword: function( password, callback ) {
		Authentication.generateSalt( function( salt ) {
			Authentication.hashPassword( password, salt, config.iterations, function( hash ) {
				callback( {
					salt: salt,
					hash: hash,
					iterations: config.iterations
				} );
			} );
		} );
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
