var prefix = 'checkout';

var	express = require( 'express' ),
	app = express(),
	Items = require( __dirname + '/../models/items' ),
	Users = require( __dirname + '/../models/users' ),
	ObjectId = require( 'mongoose' ).Schema.Types.ObjectId;

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'checkout';
	if ( ! req.session.user ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'Please login' );
		res.redirect( '/login' );
	} else {
		next();
	}
} );

// Audited report
app.get( '/', function( req, res ) {
	res.render( prefix + '/dashboard' );
} );

module.exports = app;
module.exports.path = '/' + prefix;
