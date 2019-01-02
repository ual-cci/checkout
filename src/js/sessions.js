var __home = __dirname + '/../..';

var session = require( 'express-session' ),
	cookie = require('cookie-parser'),
	passport = require( 'passport' );

var PostgreSqlStore = require( 'connect-pg-simple' )( session );

module.exports =  function( app, io ) {
  const { DB_USER, DB_HOST, DB_PORT, DB_NAME } = process.env;
  const pg_target = `postgres://${DB_USER}@${ DB_HOST }:${ DB_PORT }/${ DB_NAME }`;
	var store = new PostgreSqlStore( {
		conString: pg_target,
	} );

	app.use( cookie() );
	app.use( session( {
		name: 'checkout_session',
		secret: process.env.APP_SECRET,
		cookie: { maxAge: 31*24*60*60*1000 },
		saveUninitialized: false,
		store: store,
		resave: false,
		rolling: true
	} ) );

	app.use( passport.initialize() );
	app.use( passport.session() );
};
