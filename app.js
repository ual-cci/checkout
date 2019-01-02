require('dotenv').config();

var __home = __dirname;
var __static = __home + '/static';
var __src = __home + '/src';
var __apps = __home + '/apps';
var __views = __src + '/views';
var __js = __src + '/js';

var log = require( __js + '/logging' ).log;
log.info( {
	app: 'main',
	action: 'start'
} );

if ( process.env.NODE_ENV == "development" ) {
	log.warn( {
		app: 'main',
		action: 'dev-mode',
		message: "Developer mode activated"
	} );
}

const { DB_USER, DB_HOST, DB_PORT, DB_NAME } = process.env;
const pg_target = `postgres://${DB_USER}@${ DB_HOST }:${ DB_PORT }/${ DB_NAME }`;
var db = require( __js + '/database' )(pg_target);

var express = require( 'express' ),
	app = express(),
	server = require( 'http' ).Server( app );

var flash = require( 'express-flash' ),
	body = require( 'body-parser' );

var app_loader = require( __js + '/app-loader' );

// Add logging capabilities
require( __js + '/logging' ).installMiddleware( app );

// Use helmet
app.use( helmet() );

// Handle authentication
require( __js + '/authentication' ).auth( app );

// Setup static route
app.use( express.static( __static ) );

// Handle sessions
require( __js + '/sessions' )( app );

// Include support for notifications
app.use( flash() );
app.use( require( __js + '/quickflash' ) );

// Enable form body decoding
app.use( body.json() );
app.use( body.urlencoded( { extended: true } ) );

// Use PUG to render pages
app.set( 'views', __views );
app.set( 'view engine', 'pug' );
app.set( 'view cache', false );

// Load apps
app_loader( app );

// Start server
var listener = server.listen( process.env.APP_PORT ,process.env.APP_HOST, function () {
	log.info( {
		app: 'main',
		action: 'start-webserver',
		message: 'Started',
		address: listener.address()
	} );
} );
