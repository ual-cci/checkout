var __root = __dirname + '/../..';
var __config = __root + '/config/config.json';

var config = require( __config );

var apps = [];

var gitRev = require( 'git-rev' );
var git = '';

gitRev.short( function( str ) {
	console.log( 'Git hash: ' + str + '\n' );
	git = str;
} );

function templateLocals( req, res, next ) {
	res.locals.git = git;
	if ( config.dev ) res.locals.dev = true;
	res.locals.loggedInUser = req.user;
	res.locals.moment = require( 'moment' );
	res.locals.config = {};
	res.locals.config.pw_tries = config['password-tries'];
	next();
};

module.exports = function( a ) {
	apps = a;
	return templateLocals;
}
