var	express = require( 'express' ),
	app = express();

app.set( 'views', __dirname + '/views' );

app.get( '/', function ( req, res ) {
	res.sendStatus( 200 );
} );

module.exports = function( config ) { return app; };
