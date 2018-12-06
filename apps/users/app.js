var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var pug = require( 'pug' );

var db = require( __js + '/database' )(),
	Items = db.Items,
	Users = db.Users,
	Courses = db.Courses,
	Years = db.Years,
	Printers = db.Printers,
	Actions = db.Actions;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

// List view
app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Courses.get( function( err, courses ) {
		Years.get( function( err, years ) {
			var opts = {
				lookup: [ 'year', 'course', 'contact', 'printer' ],
				where: {}
			};

			// Set sort options
			var sortby_valid_options = [ 'name', 'course', 'year', 'barcode' ];
			var direction_valid_options = [ 'asc', 'desc' ];
			if ( sortby_valid_options.indexOf( req.query.sortby ) != -1 && direction_valid_options.indexOf[ req.query.direction ] != -1 ) {
				var sortby = req.query.sortby;
				if ( req.query.sortby == 'name' ) sortby = 'name';
				if ( req.query.sortby == 'course' ) sortby = 'course_name';
				if ( req.query.sortby == 'year' ) sortby = 'year_name';
				if ( req.query.sortby == 'barcode' ) sortby = 'barcode';
				opts.orderby = sortby;
				opts.direction = req.query.direction;
			} else {
				opts.orderby = 'name';
				opts.direction = 'asc';
			}

			// Set filters
			if ( req.query.status ) {
				if ( req.query.status == 'active' )	opts.where.disable = 0;
				if ( req.query.status == 'disabled' )	opts.where.disable = 1;
			} else {
				opts.where.disable = 0;
			}
			if ( req.query.course ) opts.where.course_id = req.query.course;
			if ( req.query.year ) opts.where.year_id = req.query.year;

			// Get items
			Users.get( opts, function( err, users ) {
				res.render( 'users', {
					users: users,
					courses: courses,
					years: years,
					selected: {
						status: req.query.status ? req.query.status : '',
						course: req.query.course ? req.query.course : '',
						year: req.query.year ? req.query.year : ''
					},
					sortby: ( req.query.sortby ? req.query.sortby : 'name' ),
					direction: ( req.query.direction ? req.query.direction : 'asc' )
				} );
			} );
		} );
	} );
} )

// Edit multiple
app.post( '/edit', auth.isLoggedIn, function ( req, res ) {
	if ( req.body.fields ) {
		if ( ! Array.isArray( req.body.edit ) ) {
			req.flash( 'warning', 'Only one user was selected for group editing, use the single edit form' );
			res.redirect( '/users/' + req.body.edit + '/edit' );
			return;
		}

		var user = {}
		if ( req.body.fields.indexOf( 'course' ) != -1 && req.body.course != '' )
			user.course_id = req.body.course;

		if ( req.body.fields.indexOf( 'year' ) != -1 && req.body.year != '' )
			user.year_id = req.body.year;

		if ( req.body.fields.indexOf( 'status' ) != -1 && req.body.status != '' )
			user.disable = ( req.body.status == 'disabled' ? true : false );

		Users.updateMultiple( req.body.edit, user, function ( err, result ) {
			if ( ! err ) {
				req.flash( 'success', 'User updated' );
				res.redirect( app.mountpath );
			} else {
				req.flash( 'danger', err.message );
				res.redirect( app.mountpath + '/' + req.params.id );
			}
		} );
	} else {
		Years.get( function( err, years ) {
			Courses.get( function( err, courses ) {
				if ( ! Array.isArray( req.body.edit ) ) {
					req.flash( 'warning', 'Only one user was selected for group editing, use the single edit form' );
					res.redirect( '/users/' + req.body.edit + '/edit' );
					return;
				}

				var opts = {
					lookup: [ 'course', 'year' ],
					where: {},
					orderby: 'users.barcode',
					direction: 'asc'
				};

				// Get items
				Users.getMultipleById( req.body.edit, opts, function( err, users ) {
					res.render( 'edit-multiple', {
						users: users,
						courses: courses,
						years: years
					} );
				} );
			} );
		} );
	}
} );

// View user
app.get( '/:id', auth.isLoggedIn, function( req, res ) {
	var opts = { lookup: [ 'printer', 'course', 'year', 'contact' ] };
	Users.getById( req.params.id, opts, function( err, user ) {
		if ( user ) {
			Items.getOnLoanToUserId( req.params.id, function( err, onloan ) {
				Actions.getUserHistoryById( req.params.id, function( err, history ) {
					var email = pug.renderFile( __dirname + '/views/email.pug', { name: user.name, items: onloan } );
					res.render( 'user', {
						user: user,
						onloan: onloan,
						history: history,
						email: email
					} );
				} );
			} );
		} else {
			req.flash( 'danger', 'User not found' );
			res.redirect( app.mountpath );
		}
	} )
} )

// Edit user
app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	var opts = { lookup: [ 'printer', 'course', 'year' ] };
	Users.getById( req.params.id, opts, function( err, user ) {
		if ( user ) {
			Printers.get( function( err, printers ) {
				Years.get( function( err, years ) {
					Courses.get( function( err, courses ) {
						res.render( 'edit', {
							courses: courses,
							years: years,
							user: user,
							printers: printers
						} );
					} );
				} );
			} );
		} else {
			req.flash( 'danger', 'User not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	var user = {
		name: req.body.name,
		barcode: req.body.barcode,
		email: req.body.email,
		course_id: req.body.course,
		year_id: req.body.year,
		printer_id: req.body.printer ? req.body.printer : null,
		type: req.body.type,
		disable: req.body.disable ? true : false
	};

	if ( req.body.audit_point ) {
		user.audit_point = new Date( req.body.audit_point );
	} else {
		user.audit_point = null;
	}

	auth.generatePassword( req.body.password, function( password ) {
		if ( req.body.password ) {
			user.pw_hash = password.hash;
			user.pw_salt = password.salt;
			user.pw_iterations = password.iterations;
		}

		Users.update( req.params.id, user, function ( err ) {
			if ( ! err ) {
				req.flash( 'success', 'User updated' );
			} else {
				req.flash( 'danger', err.message );
			}
			res.redirect( app.mountpath + '/' + req.params.id );
		} );
	} );
} )

app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	if ( req.params.id == req.user.id ) {
		req.flash( 'danger', 'You cannot delete the logged in user.' );
		res.redirect( app.mountpath );
		return
	}

	Users.getById( req.params.id, function( err, user ) {
		if ( user ) {
			Items.getOnLoanToUserId( user.id, function( err, items ) {
				if ( items.length > 0 ) {
					req.flash( 'danger', 'Users cannot be deleted if they have items on loan to them.' );
					res.redirect( app.mountpath + '/' + user.id );
				} else {
					res.render( 'confirm-remove', {
						selected: user
					} );
				}
			} );
		} else {
			req.flash( 'danger', 'User not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	if ( req.params.id == req.user.id ) {
		req.flash( 'danger', 'You cannot delete the logged in user.' );
		res.redirect( app.mountpath );
		return
	}

	Users.getById( req.params.id, function( err, user ) {
		if ( user ) {
			Items.getOnLoanToUserId( user.id, function( err, items ) {
				if ( items.length > 0 ) {
					req.flash( 'danger', 'Users cannot be deleted if they have items on loan to them.' );
					res.redirect( app.mountpath + '/' + user.id );
				} else {
					Actions.removeByUserId( user.id, function( err ) {
						if ( err ) {
							req.flash( 'danger', 'Could not remove user history' );
							res.redirect( app.mountpath );
							return;
						} else {
							Users.remove( user.id, function( err ) {
								if ( err ) {
									req.flash( 'danger', 'Could not remove user' );
									res.redirect( app.mountpath );
									return;
								}

								req.flash( 'success', 'User and their history removed' );
								res.redirect( app.mountpath );
							} );
						}
					} )
				}
			} );
		} else {
			req.flash( 'danger', 'User not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

module.exports = function( config ) { return app; };
