var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var swig = require( 'swig' );

var db = require( __js + '/database' ),
	Items = db.Items,
	Users = db.Users,
	Courses = db.Courses,
	Printers = db.Printers;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Courses.find( function( err, courses ) {
		var filter = {};
		if ( req.query.course ) filter.course = req.query.course;
		Users.find( filter ).populate( 'course' ).exec( function( err, users ) {
			res.render( 'users', { users: users, courses: courses, selectedCourse: req.query.course } );
		} )
	} );
} )

// Create user
app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	Courses.find( function( err, courses ) {
		if ( courses.length > 0 ) {
			res.render( 'create', { courses: courses, user: {} } );
		} else {
			req.flash( 'warning', 'Create at least one course before creating users' )
			res.redirect( app.mountpath );
		}
	} );
} )

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	var user = {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
		type: req.body.type,
		barcode: req.body.barcode,
		email: req.body.email,
		course: req.body.course,
		printer: req.body.printer ? req.body.printer : null
	}

	if ( user.name == '' ) {
		req.flash( 'danger', 'The user must have a name' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( user.barcode == '' ) {
		req.flash( 'danger', 'The user must have a unique barcode' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( user.course == '' ) {
		req.flash( 'danger', 'The user must be assigned to a course' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( user.email == '' ) {
		req.flash( 'danger', 'The user must have an email address' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( user.type == '' ) {
		req.flash( 'danger', 'The user must have a type' );
		res.redirect( app.mountpath + '/create' );
		return;
	}

	new Users( user ).save( function ( err ) {
		if ( err ) {
			if ( err.code == 11000 ) {
				req.flash( 'danger', 'The user barcode must be unique' );
			} else {
				req.flash( 'danger', 'Unknown error creating user' );
			}
		} else {
			req.flash( 'success', 'User created' );
		}
		res.redirect( app.mountpath );
	} );
} )

// View user
app.get( '/:id', auth.isLoggedIn, function( req, res ) {
	Users.findById( req.params.id ).populate( 'course' ).exec( function( err, user ) {
		if ( user == undefined ) {
			req.flash( 'danger', 'User not found' );
			res.redirect( app.mountpath );
		} else {
			Courses.populate( user, {
				path: 'course.contact',
				model: Users
			} );

			Items.find( function( err, items ) {
				var onloan = [];
				var pastloan = [];
				for ( item in items ) {
					item = items[item];
					if ( item.transactions != undefined ) {
						// Onloan
						var last_transaction = item.transactions[ item.transactions.length - 1 ];
						if ( last_transaction != undefined ) {
							if ( last_transaction.status == 'audited' ) {
								for ( i = item.transactions.length - 1; i >= 0; i-- ) {
									if ( item.transactions[ i ].status != 'audited' ) {
										last_transaction = item.transactions[ i ];
										break;
									}
								}
							}
							if ( last_transaction.user == user._id.toString() &&
								 last_transaction.status == 'loaned' ) {
									onloan.push( item );
							}
						}

						// Historic
						for ( t = 0; t < item.transactions.length; t++ ) {
							if (item.transactions[t].user == user._id.toString() &&
								item.transactions[t] != last_transaction &&
								item.transactions[t].status == 'loaned' ) {
								 pastloan.push( item );
							 }
						}
					}
				}
				var email = swig.renderFile( __dirname + '/views/email.swig', { name: user.name, items: onloan } );
				res.render( 'user', { user: user, onloan: onloan, pastloan: pastloan, email: email } );
			} );
		}
	} )
} )

// Edit user
app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Printers.find( function( err, printers ) {
		Users.findOne( { _id: req.params.id }, function( err, user ) {
			if ( user == undefined ) {
				req.flash( 'danger', 'User not found' );
				res.redirect( app.mountpath );
			} else {
				Courses.find( function( err, courses ) {
					res.render( 'edit', { courses:courses, user: user, printers: printers } );
				} );
			}
		} )
	} );
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Users.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			barcode: req.body.barcode,
			email: req.body.email,
			course: req.body.course,
			printer: req.body.printer ? req.body.printer : null,
			type: req.body.type,
			disable: req.body.disable
		}
	} ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.flash( 'success', 'User updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.flash( 'warning', 'User was not changed' );
		} else {
			req.flash( 'danger', 'There was an error updating the user' );
		}
		res.redirect( app.mountpath + '/' + req.params.id );
	}, function ( status ) {
		req.flash( 'danger', 'There was an error updating the user' );
		res.redirect( app.mountpath + '/' + req.params.id );
	} );
} )

module.exports = function( config ) { return app; };
