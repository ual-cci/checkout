const session = require( 'express-session' );
const cookie = require('cookie-parser');
const passport = require( 'passport' );

var PostgreSqlStore = require( 'connect-pg-simple' )( session );

const { constructTarget } = require('../js/utils.js');

module.exports =  function( app, io ) {
	var store = new PostgreSqlStore( {
		conString: constructTarget(),
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
