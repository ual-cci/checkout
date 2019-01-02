var __root = __dirname + '/../..';
var __root = '../..';
var __src = __root + '/src';
var __js = __src + '/js';

var apps = [];

var gitRev = require( 'git-rev' );
var git = '';

gitRev.short( function( str ) {
	git = str;
} );

function templateLocals( req, res, next ) {
	res.locals.git = git;
	if ( process.env.NODE_ENV == "development" ) res.locals.dev = true;
	res.locals.loggedInUser = req.user;
	res.locals.moment = require( 'moment' );
	res.locals.config = {};
	res.locals.config.pw_tries = process.env.USER_PW_TRIES;
	next();
};

module.exports = function( a ) {
	apps = a;
	return templateLocals;
}
