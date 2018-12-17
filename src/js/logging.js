require('dotenv').config();

var __root = '../..';
var __static = __root + '/static';
var __src = __root + '/src';
var __views = __src + '/views';
var __js = __src + '/js';

var bunyan = require( 'bunyan' ),
	bunyanMiddleware = require( 'bunyan-middleware' )

var crypto = require('crypto')
var hash = crypto.createHash;
var randomKey = crypto.randomBytes(256);

// Bunyan logging
var bunyanConfig = {
	name: process.env.APP_NAME,
	streams: []
};

if ( process.env.LOG_STDOUT ) {
	bunyanConfig.streams.push(
		{
			level: 'debug',
			stream: process.stdout
		}
	)
	bunyanConfig.streams.push(
		{
			level: 'error',
			stream: process.stderr
		}
	)
}

<<<<<<< HEAD
if ( process.env.LOG_PATH ) {
=======
if ( process.env.LOG_PATH != undefined ) {
>>>>>>> Add basic logging and move dev mode into npm run dev
	bunyanConfig.streams.push({
		type: "rotating-file",
		path: process.env.LOG_PATH,
		period: '1d', // rotates every day
		count: 7 // keeps 7 days
	})
}

var logger = bunyan.createLogger( bunyanConfig );

function loggingMiddleware(req, res, next) {
	var log = req.log;
<<<<<<< HEAD
	function logAThing( level, params, req ) {
		params.ip = req.connection.remoteAddress; //TODO: this will only be correct when behind a reverse proxy, if app.set('trust proxy') is enabled!
		if (! params.sensitive ) {
=======
	function logAThing( level, params, req )
	{
		params.ip = req.connection.remoteAddress; //TODO: this will only be correct when behind a reverse proxy, if app.set('trust proxy') is enabled!
		if (! params.sensitive )
		{
>>>>>>> Add basic logging and move dev mode into npm run dev
			params.sensitive = {};
		}
		if ( req.user ) {
			params.sensitive._user = {
				uuid: req.user.uuid,
				firstname: req.user.firstname,
				lastname: req.user.lastname,
				email: req.user.email
			};
<<<<<<< HEAD
			params.anon_userid = hash('sha1').update(req.user.id + randomKey).digest('base64');
		}
		if ( req.sessionID ) {
			params.sensitive.sessionID = req.sessionID;
			params.anon_sessionId = hash('sha1').update(req.sessionID + randomKey).digest('base64');
		}
		if ( params.sensitive ) {
			log[level](params);
			params.sanitised = true;
=======
			params.anon_userid = hash('sha1').update(req.user.uuid + randomKey).digest('base64');
		}
		if ( req.sessionID )
		{
			params.sensitive.sessionID = req.sessionID;
			params.anon_sessionId = hash('sha1').update(req.sessionID + randomKey).digest('base64');
		}
		if (params.sensitive)
		{
			log[level](params);
>>>>>>> Add basic logging and move dev mode into npm run dev
			delete params.sensitive;
		}
		log[level](params);
	}

	req.log = {
<<<<<<< HEAD
		info: function ( params ) {
			logAThing( 'info', params , req );
		},
		debug: function ( params ) {
			logAThing( 'debug', params , req );
		},
		warn: function ( params ) {
			logAThing( 'warn', params , req );
		},
		error: function ( params ) {
			logAThing( 'error', params , req );
		},
		fatal: function ( params ) {
=======
		info: function (params)
		{
			logAThing( 'info', params , req );
		},
		debug: function (params)
		{
			logAThing( 'debug', params , req );
		},
		error: function (params)
		{
			logAThing( 'error', params , req );
		},
		fatal: function (params)
		{
>>>>>>> Add basic logging and move dev mode into npm run dev
			logAThing( 'fatal', params , req );
		}
	}
	next();
}

module.exports = {
	installMiddleware: function (app) {
		app.use( bunyanMiddleware( { logger: logger, level: "trace" } ) );
		app.use( loggingMiddleware );
	},
	log: logger
}
