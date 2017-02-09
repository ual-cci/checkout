var prefix = 'checkout';

var	express = require( 'express' ),
	app = express();

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'checkout';
	if ( ! req.isAuthenticated() ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'Please login' );
		res.redirect( '/login' );
	} else {
		next();
	}
} );

app.get( '/', function( req, res ) {
	res.render( prefix + '/checkout' );
} );

module.exports = app;
module.exports.path = '/' + prefix;
