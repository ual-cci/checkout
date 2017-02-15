

var passport = require( 'passport' ),
	passportSocketIo = require('passport.socketio'),
	LocalStrategy = require( 'passport-local' ).Strategy;

	app.use( passport.initialize() );
	app.use( passport.session() );
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
