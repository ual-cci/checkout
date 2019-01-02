var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

const Printers = require('../../src/models/printers.js');
const Users = require('../../src/models/users.js');

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

// View
app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Printers.get( function( err, printers ) {
		res.render( 'printers', { printers: printers } );
	} )
} );

// Create
app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	res.render( 'create', { printer: {} } );
} );

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The printer requires a name' );
		return res.redirect( app.mountpath + '/create' );
	}

	if ( req.body.url == '' ) {
		req.flash( 'danger', 'The printer requires a URL' );
		return res.redirect( app.mountpath + '/create' );
	}

	Printers.create( {
		name: req.body.name,
		url: req.body.url
	}, function ( err ) {
		if ( err ) {
			console.log( err );
			req.flash( 'dange', 'Error creating printer' );
		} else {
			req.flash( 'success', 'Printer created' );
		}
		res.redirect( app.mountpath );
	} );
} )

// Edit
app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Printers.getById( req.params.id, function( err, printer ) {
		if ( printer == undefined ) {
			req.flash( 'danger', 'Printers not found' );
			res.redirect( app.mountpath );
		} else {
			res.render( 'edit', { printer: printer } );
		}
	} )
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The printer requires a name' );
		return res.redirect( app.mountpath );
	}

	if ( req.body.url == '' ) {
		req.flash( 'danger', 'The printer requires a URL' );
		return res.redirect( app.mountpath );
	}

	Printers.update( req.params.id, {
		name: req.body.name,
		url: req.body.url
	}, function ( err ) {
		if ( err ) {
			console.log( err );
			req.flash( 'dange', 'Error updating printer' );
		} else {
			req.flash( 'success', 'Printer updated' );
		}
		res.redirect( app.mountpath );
	} );
} )

// Remove
app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Printers.get( function( err, printers ) {
		var selected = printers.filter( function( printer ) {
			return ( printer.id == req.params.id ? printer : null );
		} );

		if ( selected[0] ) selected = selected[0];

		var list = printers.filter( function( printer ) {
			if ( printer.id == req.params.id ) printer.disabled = true;
			return printer;
		} );

		if ( selected ) {
			res.render( 'confirm-remove', {
				selected: selected,
				printers: list
			} );
		} else {
			req.flash( 'danger', 'Printer not found' );
			res.redirect( app.mountpath );
		}
	} )
} )

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Printers.getById( req.params.id, function( err, printer_to_remove ) {
		if ( ! printer_to_remove ) {
			req.flash( 'danger', 'Printer not found' );
			res.redirect( app.mountpath );
			return;
		}

		if ( req.body.printer ) {
			Printers.getById( req.body.printer, function( err, printer_to_become ) {
				if ( ! printer_to_become ) {
					req.flash( 'danger', 'New printer not found' );
					res.redirect( app.mountpath );
					return;
				}

				Users.updatePrinter( printer_to_remove.id, printer_to_become.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not transfer users to new printer' );
						res.redirect( app.mountpath );
						return;
					}

					Printers.remove( printer_to_remove.id, function( err ) {
						if ( err ) {
							req.flash( 'danger', 'Could not remove printer' );
							res.redirect( app.mountpath );
							return;
						}

						req.flash( 'success', 'Printer deleted and users transferred' );
						res.redirect( app.mountpath );
					} );
				} );
			} );
		} else {
			Users.updatePrinter( printer_to_remove.id, null, function( err ) {
				if ( err ) {
					req.flash( 'danger', 'Could not remove printer from existing users' );
					res.redirect( app.mountpath );
					return;
				}

				Printers.remove( printer_to_remove.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not remove printer' );
						res.redirect( app.mountpath );
						return;
					}

					req.flash( 'success', 'Printer removed from users and printer deleted ' );
					res.redirect( app.mountpath );
				} );
			} );
		}
	} );
} )

module.exports = function( config ) { return app; };
