var	express = require( 'express' ),
	app = express(),
	Courses = require( __dirname + '/../models/courses' ),
	Items = require( __dirname + '/../models/items' ),
	Users = require( __dirname + '/../models/users' );

var swig = require( 'swig' );

var prefix = 'courses';

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'users';
	if ( ! req.isAuthenticated() ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'Please login' );
		res.redirect( '/login' );
	} else {
		next();
	}
} );

// Index
app.get( '/', function ( req, res ) {
	Courses.find().populate( 'contact' ).exec( function( err, courses ) {
		res.render( prefix + '/courses', { courses: courses } );
	} )
} )

// Create
app.get( '/create', function ( req, res ) {
	Users.find( function( err, users ) {
		res.render( prefix + '/create', { course: {}, users: users } );
	} );
} )

app.post( '/create', function( req, res ) {
	if ( req.body.name == '' ) {
		req.add_flash( 'danger', 'The course requires a name' );
		res.redirect( '/' + prefix + '/create' );
	}

	new Courses( {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
		contact: req.body.contact
	} ).save( function ( err ) {
		req.add_flash( 'success', 'Course created' );
		res.redirect( '/' + prefix );
	} );
} )

// View
app.get( '/:id', function( req, res ) {
	Courses.findOne( { _id: req.params.id } ).populate( 'contact' ).exec( function( err, course ) {
		if ( course == undefined ) {
			req.add_flash( 'danger', 'Course not found' );
			res.redirect( '/' + prefix );
		} else {
			Users.find( { course: req.params.id }, function( err, users ) {
				Items.find().populate( 'course' ).populate( 'transactions.user' ).exec( function( err, items ) {
					var email;
					var result = {};

					for ( i in items ) {
						var item = items[i];
						if ( item.status == 'on-loan' ) {
							var owner_transaction = 0;
							for ( i = item.transactions.length - 1; i >= 0; i-- ) {
								if ( item.transactions[ i ].status == 'loaned' ) {
									last_transaction = item.transactions[ i ];
									break;
								}
							}
							if ( last_transaction.user.course == course._id.toString() ) {
								if ( result[ last_transaction.user._id.toString() ] == undefined )
									result[ last_transaction.user._id.toString() ] = {
										user: null,
										items: []
									};

								var row = result[ last_transaction.user._id.toString() ];
								row.user = last_transaction.user;
								row.items.push( item );
							}
						}
					}

					console.log( result );

					if ( course.contact != undefined ) {
						var students = {};
						email = swig.renderFile( __dirname + '/../views/courses/email.swig', { name: course.contact.name, students: result } );
					}
					res.render( prefix + '/course', { course: course, users: users, email: email } );
				} );
			} );
		}
	} )
} )

// Edit
app.get( '/:id/edit', function( req, res ) {
	Users.find( function( err, users ) {
		Courses.findOne( { _id: req.params.id }, function( err, course ) {
			if ( course == undefined ) {
				req.add_flash( 'danger', 'Course not found' );
				res.redirect( '/' + prefix );
			} else {
				res.render( prefix + '/edit', { course: course, users: users } );
			}
		} )
	} )
} )

app.post( '/:id/edit', function( req, res ) {
	if ( req.body.name == '' ) {
		req.add_flash( 'danger', 'The course requires a name' );
		res.redirect( '/' + prefix + '/create' );
	}
	Courses.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			contact: req.body.contact ? req.body.contact : null
		}
	} ).then( function ( status ) {
		if ( status.n == 1 ) {
			req.add_flash( 'success', 'Course updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.add_flash( 'warning', 'Course was not changed' );
		} else {
			req.add_flash( 'danger', 'There was an error updating the course' );
		}
		res.redirect( '/' + prefix + '/' + req.params.id );
	}, function ( status ) {
		req.add_flash( 'danger', 'There was an error updating the course' );
		res.redirect( '/' + prefix + '/' + req.params.id );
	} );
} )

module.exports = app;
module.exports.path = '/' + prefix;
