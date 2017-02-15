var	express = require( 'express' ),
	app = express();

app.set( 'views', __dirname + '/views' );

app.get( '/', function ( req, res ) {
	console.log( app.parent );

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

module.exports = function( config, sio ) {
	return app;
};
