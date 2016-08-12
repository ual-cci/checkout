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
	} else {
		next();
	}
} );

// Index
app.get( '/', function ( req, res ) {
	Courses.find( function( err, courses ) {
		var filter = {};
		if ( req.query.course ) filter.course = req.query.course;
		Users.find( filter ).populate( 'course' ).exec( function( err, users ) {
			res.render( prefix + '/users', { users: users, courses: courses, selectedCourse: req.query.course } );
		} )
	} );
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

						// Onloan
						var last_transaction = item.transactions[ item.transactions.length - 1 ];
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

				res.render( prefix + '/user', { user: user, onloan: onloan, pastloan: pastloan } );
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
