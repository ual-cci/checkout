var	express = require( 'express' ),
	app = express(),
	Courses = require( __dirname + '/../models/courses' ),
	Items = require( __dirname + '/../models/items' ),
	Users = require( __dirname + '/../models/users' );

var prefix = 'users';

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'users';
	if ( ! req.session.user ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'Please login' );
		res.redirect( '/login' );
	} else if ( ! req.session.user.isStaff ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'You must be staff to access this function' );
		res.redirect( '/' );
	} else {
		next();
	}
} );

// Index
app.get( '/', function ( req, res ) {	
	Users.find().populate( 'course' ).exec( function( err, users ) {
		res.render( prefix + '/users', { users: users } );
	} )
} )

// Create user
app.get( '/create', function ( req, res ) {
	Courses.find( function( err, courses ) {
		if ( courses.length > 0 ) {
			res.render( prefix + '/create', { courses: courses, user: { name: '', course: '', value: '', notes: '', barcode: req.query.barcode } } );	
		} else {
			req.add_flash( 'warning', 'Create at least one course before creating users' )
			res.redirect( '/' + prefix );
		}
	} );
} )

app.post( '/create', function( req, res ) {
	if ( ! req.session.user.isAdmin && req.body.type == 'admin' ) {
		req.add_flash( 'danger', 'Only admin users can grant admin access to an account' );
		res.redirect( '/' + prefix + '/create' );
		return;
	}

	var user = {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
		type: req.body.type,
		barcode: req.body.barcode,
		email: req.body.email,
		course: req.body.course
	}

	if ( user.name == '' ) {
		req.add_flash( 'danger', 'The user must have a name' );
		res.redirect( '/' + prefix + '/create' );
		return;
	} else if ( user.barcode == '' ) {
		req.add_flash( 'danger', 'The user must have a unique barcode' );
		res.redirect( '/' + prefix + '/create' );
		return;
	} else if ( user.course == '' ) {
		req.add_flash( 'danger', 'The user must be assigned to a course' );
		res.redirect( '/' + prefix + '/create' );
		return;
	} else if ( user.email == '' ) {
		req.add_flash( 'danger', 'The user must have an email address' );
		res.redirect( '/' + prefix + '/create' );
		return;
	} else if ( user.type == '' ) {
		req.add_flash( 'danger', 'The user must have a type' );
		res.redirect( '/' + prefix + '/create' );
		return;
	}

	new Users( user ).save( function ( err ) {
		if ( err ) {
			if ( err.code == 11000 ) {
				req.add_flash( 'danger', 'The user barcode must be unique' );
			} else {
				req.add_flash( 'danger', 'Unknown error creating user' );
			}
		} else {
			req.add_flash( 'success', 'User created' );
		}
		res.redirect( '/' + prefix );
	} );
} )

// View user
app.get( '/:id', function( req, res ) {
	Users.findById( req.params.id ).populate( 'course' ).exec( function( err, user ) {
		if ( user == undefined ) {
			req.add_flash( 'danger', 'User not found' );
			res.redirect( '/' + prefix );
		} else {
			Items.find( function( err, items ) {
				var onloan = [];
				var pastloan = [];
				for ( item in items ) {
					item = items[item];
					if ( item.transactions != undefined ) {
						for ( t = item.transactions.length - 1; t >= 0; t-- ) {
							if ( item.transactions[t].user == user._id.toString() &&
								 item.transactions[t].status == 'loaned' ) {
								if ( t == item.transactions.length - 1 ) {
									onloan.push( item );
								} else {
									pastloan.push( item );
								}
							}
						}
					}
				}

				if ( req.session.user.isStaff ) {
					res.render( prefix + '/user', { user: user, onloan: onloan, pastloan: pastloan } );
				} else {
					res.render( prefix + '/user-minimal', { user: user, onloan: onloan, pastloan: pastloan } );
				}
			} );
		}
	} )	
} )

// Edit user
app.get( '/:id/edit', function( req, res ) {
	Users.findOne( { _id: req.params.id }, function( err, user ) {
		if ( user == undefined ) {
			req.add_flash( 'danger', 'User not found' );
			res.redirect( '/' + prefix );
		} else {
			Courses.find( function( err, courses ) {
				res.render( prefix + '/edit', { courses:courses, user: user } );
			} );
		}
	} )
} )

app.post( '/:id/edit', function( req, res ) {
	if ( ! req.session.user.isAdmin && req.body.type == 'admin' ) {
		req.add_flash( 'danger', 'Only admin users can grant admin access to an account' );
		res.redirect( '/' + prefix + '/' + req.params.id );
		return;
	}

	Users.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			barcode: req.body.barcode,
			email: req.body.email,
			course: req.body.course,
			type: req.body.type
		}
	} ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.add_flash( 'success', 'User updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.add_flash( 'warning', 'User was not changed' );
		} else {
			req.add_flash( 'danger', 'There was an error updating the user' );
		}
		res.redirect( '/' + prefix + '/' + req.params.id );
	}, function ( status ) {
		req.add_flash( 'danger', 'There was an error updating the user' );
		res.redirect( '/' + prefix + '/' + req.params.id );
	} );
} )

module.exports = app;
module.exports.path = '/' + prefix;