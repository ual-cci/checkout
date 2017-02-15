var	express = require( 'express' ),
	app = express(),
	passport = require( 'passport' );

app.set( 'views', __dirname + '/views' );

app.get( '/', function ( req, res ) {
	if ( req.isAuthenticated() ) {
		res.redirect( '/checkout' );
	} else {
		res.render( 'login' );
	}
} );

app.post( '/', passport.authenticate( 'local', {
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

module.exports = function( config ) { return app; };
