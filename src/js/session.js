var session = require( 'express-session' ),
	config = require( '../../config/config.json' ),
	cookie = require('cookie-parser'),
	passport = require( 'passport' );

module.exports =  function( app ) {
	app.use( cookie() );
	app.use( session( {
		secret: config.secret,
		cookie: { maxAge: 31*24*60*60*1000 },
		saveUninitialized: false,
		resave: false,
		rolling: true
	} ) );

	app.use( passport.initialize() );
	app.use( passport.session() );
}
var session = require( 'express-session' ),
	MongoDBStore = require( 'connect-mongodb-session' )( session );
	var store = new MongoDBStore( {
		uri: config.mongo,
		collection: 'sessionStore'
	} );
	store.on( 'error', function( error ) {
		console.log( error );
	} );

app.use( cookie() );
var sessionMiddleware = session( {
	secret: config.secret,
	cookie: { maxAge: 31*24*60*60*1000 },
	store: store,
	saveUninitialized: true,
	resave: true
} );
app.use( sessionMiddleware );

io.use( passportSocketIo.authorize( {
	key: 'connect.sid',
	secret: config.secret,
	store: store,
	passport: passport,
	cookieParser: cookie
} ) );
