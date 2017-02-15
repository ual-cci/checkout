var config, apps = [];

function templateLocals( req, res, next ) {
	if ( config.dev ) res.locals.dev = true;
	res.locals.loggedInUser = req.user;
	next();
};

module.exports = function( c, a ) {
	config = c;
	apps = a;
	return templateLocals;
}
