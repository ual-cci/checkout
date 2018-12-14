var __home = __dirname + '/../..';
var __src = __home + '/src';
var __js = __src + '/js';

var db = require( __js + '/database' )();
var Permissions = db.Permissions,
	Users = db.Users;

var passport = require( 'passport' ),
  LocalStrategy = require( 'passport-local' ).Strategy;

const logger = require('./logger.js');

var crypto = require( 'crypto' );

var Authentication = {
	auth: function( app ) {
		// Add support for local authentication
		passport.use(
			new LocalStrategy( function( email, password, done ) {
				Users.getByEmail( email, function( err, user ) {
					if ( user ) {
						// Has account exceeded it's password tries?
						if ( user.pw_attempts >= process.env.USER_PW_TRIES ) {
							return done( null, false, { message: 'Account locked out' } );
						}

						if ( user.type == 'admin' && ! user.disable ) {
							if ( ! user.pw_salt ) return setTimeout( function() { return done( null, false, { message: 'Invalid login' } ); }, 1000 );

							// Hash the entered password with the users salt
							Authentication.hashPassword( password, user.pw_salt, user.pw_iterations, function( hash ) {

								// Check the hashes match
								if ( hash == user.pw_hash ) {
									var flash = {};
									if ( user.pw_attempts > 0 ) {
										flash.message = `There has been ${user.pw_attempts} attempt(s) to login to your account since you last logged in`;
										Users.update( user.id, { pw_attempts: 0 }, function( err ) {} )
									}

									return done( null, { id: user.id }, flash );
								}

								// Increment password tries
								Users.update( user.id, { pw_attempts: user.pw_attempts + 1 }, function( err ) {} )

								// Delay by 1 second to slow down password guessing
								return setTimeout( function() { return done( null, false, { message: 'Invalid login' } ); }, 1000 );
							} );
						} else {
							// If account is disabled or not admin
							// Delay by 1 second to slow down password guessing
							return setTimeout( function() { return done( null, false, { message: 'Invalid login' } ); }, 1000 );
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
			Users.getById( data.id, { lookup: 'printers' }, function( err, user ) {
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
			Authentication.hashPassword( password, salt, parseInt(process.env.USER_PW_ITERATIONS, 10), function( hash ) {
				callback( {
					salt: salt,
					hash: hash,
					iterations: parseInt(process.env.USER_PW_ITERATIONS, 10)
				} );
			} );
		} );
	},
	loggedIn: function( req ) {
		// Is the user logged in?
		if ( req.isAuthenticated() && req.user != undefined && req.user.type == 'admin' ) {
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
				req.flash( 'error', "Please login" );
				res.redirect( '/login' );
				return;
		}
	}
}

module.exports = Authentication;
