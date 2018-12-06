var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var pug = require( 'pug' );

var db = require( __js + '/database' )(),
	Years = db.Years,
	Items = db.Items,
	Users = db.Users;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Years.get( function( err, years ) {
		res.render( 'years', { years: years } );
	} )
} );

app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	res.render( 'create' );
} );

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The year requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	Years.create( req.body.name, function( err, year ) {
		if ( err ) {
			req.flash( 'danger', 'Error creating year' );
			res.redirect( app.mountpath );
		} else {
			req.flash( 'success', 'Year created' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Years.getById( req.params.id, function( err, year ) {
		if ( year ) {
			res.render( 'edit', { year: year } );
		} else {
			req.flash( 'danger', 'Course not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The year requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	Years.update( req.params.id, req.body.name, function( err ) {
		if ( err ) {
			req.flash( 'danger', 'Error updating year' );
			res.redirect( app.mountpath );
		} else {
			req.flash( 'success', 'Year updated' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Years.get( function( err, years ) {
		var selected = years.filter( function( year ) {
			return ( year.id == req.params.id ? year : null );
		} );

		if ( selected[0] ) selected = selected[0];

		var list = years.filter( function( year ) {
			if ( year.id == req.params.id ) year.disabled = true;
			return year;
		} );

		if ( selected ) {
			res.render( 'confirm-remove', {
				selected: selected,
				years: list
			} );
		} else {
			req.flash( 'danger', 'Years not found' );
			res.redirect( app.mountpath );
		}
	} )
} )

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Years.getById( req.params.id, function( err, year_to_remove ) {
		if ( ! year_to_remove ) {
			req.flash( 'danger', 'Year not found' );
			res.redirect( app.mountpath );
			return;
		}
		Years.getById( req.body.year, function( err, year_to_become ) {
			if ( ! year_to_become ) {
				req.flash( 'danger', 'New year not found' );
				res.redirect( app.mountpath );
				return;
			}

			Users.updateYear( year_to_remove.id, year_to_become.id, function( err ) {
				if ( err ) {
					req.flash( 'danger', 'Could not transfer users to new year' );
					res.redirect( app.mountpath );
					return;
				}

				Years.remove( year_to_remove.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not remove year' );
						res.redirect( app.mountpath );
						return;
					}

					req.flash( 'success', 'Year deleted and users transferred' );
					res.redirect( app.mountpath );
				} );
			} );
		} );
	} );
} )

module.exports = function( config ) { return app; };
