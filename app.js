var __home = __dirname;
var __config = __home + '/config/config.json';
var __static = __home + '/static';
var __src = __home + '/src';
var __apps = __home + '/apps';
var __views = __src + '/views';
var __js = __src + '/js';

var config = require( __config ),
	fs = require( 'fs' ),
	database = require( __js + '/database' ).connect(),
	express = require( 'express' ),
	app = express(),
	server = require( 'http' ).Server( app )
	io = require( __js + '/socket' )( server ),
	flash = require( 'express-flash' ),
	swig = require( 'swig' ),
	body = require( 'body-parser' );

var apps = [];

console.log( "Starting..." );

// Handle authentication + sockets
require( __js + '/authentication' ).auth( app, io );

// Setup static route
app.use( express.static( __static ) );

// Handle sessions
require( __js + '/sessions' )( app, io );

// Include support for notifications
app.use( flash() );
app.use( require( __js + '/quickflash' ) );

// Enable form body decoding
app.use( body.json() );
app.use( body.urlencoded( { extended: true } ) );

// Load apps

// Loop through main app director contents
var files = fs.readdirSync( __apps );
for ( var f in files ) {
	// Only read directories
	var file = __apps + '/' + files[f];
	if ( fs.statSync( file ).isDirectory() ) {

		// Check for a config.json file
		var config_file = file + '/config.json';
		if ( fs.existsSync( config_file ) ) {

			// Parse the config into apps array
			var output = JSON.parse( fs.readFileSync( config_file ) );
			output.uid = files[f];
			if ( output.priority == undefined ) output.priority = 100;
			output.app = file + '/app.js';

			apps.push( output );
		}
	}
}
apps.sort( function( a, b ) {
	return a.priority < b.priority;
} );

// Load in local variables such as config.globals
app.use( require( __js + '/template-locals' )( config, apps ) );

// Use SWIG to render pages
app.engine( 'swig', swig.renderFile );
app.set( 'views', __views );
app.set( 'view engine', 'swig' );
app.set( 'view cache', false );
swig.setDefaults( { cache: false } );

// Route apps
for ( var a in apps ) {
	var _app = apps[a];
	console.log( "	Route: /" + _app.path );
	var new_app = require( _app.app )( _app );
	app.use( '/' + _app.path, new_app );
}

// Error 404
app.get( '*', function( req, res ) {
	res.status( 404 );
	res.render( '404' );
} );
console.log( "	Route: *" );

// Start server
var listener = server.listen( config.port ,config.host, function () {
	console.log( "Server started on: " + listener.address().address + ':' + listener.address().port );
} );
