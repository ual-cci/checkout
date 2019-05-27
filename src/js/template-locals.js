var gitRev = require( 'git-rev' );
var git = '';

gitRev.short(str => {
	git = str;
});

function templateLocals( req, res, next ) {
	res.locals.git = git;
	if ( process.env.NODE_ENV == "development" ) res.locals.dev = true;
	res.locals.loggedInUser = req.user;
	res.locals.moment = require( 'moment' );
	res.locals.config = {
    pw_tries: process.env.USER_PW_TRIES
  };
	next();
};

module.exports = function( apps ) {
	return templateLocals;
}
