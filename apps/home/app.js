var	express = require( 'express' ),
	app = express();

app.set( 'views', __dirname + '/views' );

app.get( '/', function ( req, res ) {
	if ( req.isAuthenticated() ) {
		res.redirect( '/checkout' );
	} else {
		res.redirect( '/login' );
	}
} );

module.exports = function( config ) { return app; };
