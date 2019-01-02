var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

const Departments = require('../../src/models/departments.js');
const Items = require('../../src/models/items.js');

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Departments.get( function( err, departments ) {
		res.render( 'departments', { departments: departments } );
	} )
} );

app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	res.render( 'create', { department: {} } );
} )

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The department requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	Departments.create( req.body.name, function( err, result ) {
		if ( err ) {
			req.flash( 'danger', 'Department not created' );
			res.redirect( app.mountpath );
		} else {
			req.flash( 'success', 'Department created' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Departments.getById( req.params.id, function( err, department ) {
		if ( ! department ) {
			req.flash( 'danger', 'Department not found' );
			res.redirect( app.mountpath );
		} else {
			res.render( 'edit', { department: department } );
		}
	} )
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The department requires a name' );
		res.redirect( app.mountpath + '/edit' );
	}

	Departments.update( req.params.id, req.body.name, function( err ) {
		if ( err ) {
			req.flash( 'danger', 'Department not updated' );
			res.redirect( app.mountpath );
			console.log( err );
		} else {
			req.flash( 'success', 'Department updated' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Departments.get( function( err, departments ) {
		var selected = departments.filter( function( department ) {
			return ( department.id == req.params.id ? department : null );
		} );

		if ( selected[0] ) selected = selected[0];

		var list = departments.filter( function( department ) {
			if ( department.id == req.params.id ) department.disabled = true;
			return department;
		} );

		if ( selected ) {
			res.render( 'confirm-remove', {
				selected: selected,
				departments: list
			} );
		} else {
			req.flash( 'danger', 'Departments not found' );
			res.redirect( app.mountpath );
		}
	} )
} )

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Departments.getById( req.params.id, function( err, department_to_remove ) {
		if ( ! department_to_remove ) {
			req.flash( 'danger', 'Department not found' );
			res.redirect( app.mountpath );
			return;
		}
		Departments.getById( req.body.department, function( err, department_to_become ) {
			if ( ! department_to_become ) {
				req.flash( 'danger', 'New department not found' );
				res.redirect( app.mountpath );
				return;
			}

			Items.updateDepartment( department_to_remove.id, department_to_become.id, function( err ) {
				if ( err ) {
					req.flash( 'danger', 'Could not transfer items to new department' );
					res.redirect( app.mountpath );
					return;
				}

				Departments.remove( department_to_remove.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not remove department' );
						res.redirect( app.mountpath );
						return;
					}

					req.flash( 'success', 'Department deleted and items transferred' );
					res.redirect( app.mountpath );
				} );
			} );
		} );
	} );
} )

module.exports = function( config ) { return app; };
