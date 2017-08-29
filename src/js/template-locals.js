var __root = __dirname + '/../..';
var __config = __root + '/config/config.json';

var config = require( __config );

var apps = [];

function templateLocals( req, res, next ) {
	if ( config.dev ) res.locals.dev = true;
	res.locals.loggedInUser = req.user;
	res.locals.moment = require( 'moment' );
	next();
};

module.exports = function( a ) {
	apps = a;
	return templateLocals;
}
