app.use( function( req, res, next ) {
	if ( config.dev ) res.locals.dev = true;
	res.locals.loggedInUser = req.user;
	next();
} );
