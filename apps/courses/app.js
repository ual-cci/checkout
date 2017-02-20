var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var swig = require( 'swig' );

var db = require( __js + '/database' ),
	Courses = db.Courses,
	Items = db.Items,
	Users = db.Users;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Courses.find().populate( 'contact' ).exec( function( err, courses ) {
		res.render( 'courses', { courses: courses } );
	} )
} );

app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	Users.find( function( err, users ) {
		res.render( 'create', { course: {}, users: users } );
	} );
} );

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The course requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	new Courses( {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
		contact: req.body.contact
	} ).save( function ( err ) {
		req.flash( 'success', 'Course created' );
		res.redirect( app.mountpath );
	} );
} )

app.get( '/:id', auth.isLoggedIn, function( req, res ) {
	Courses.findOne( { _id: req.params.id } ).populate( 'contact' ).exec( function( err, course ) {
		if ( course == undefined ) {
			req.flash( 'danger', 'Course not found' );
			res.redirect( app.mountpath );
		} else {
			Users.find( { course: req.params.id, disable: { $ne: true } }, function( err, users ) {
				Items.find().populate( 'department' ).populate( 'group' ).populate( 'course' ).populate( 'transactions.user' ).exec( function( err, items ) {
					var email;
					var user_result = {};
					var item_results = [];

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

							if ( last_transaction.user.course == course._id.toString() && last_transaction.user.disable != true ) {
								item_results.push( item );
								item.owner = last_transaction.user;

								if ( user_result[ last_transaction.user._id.toString() ] == undefined )
									user_result[ last_transaction.user._id.toString() ] = {
										user: null,
										items: []
									};

								var row = user_result[ last_transaction.user._id.toString() ];
								row.user = last_transaction.user;
								row.items.push( item );
							}
						}
					}

					if ( course.contact != undefined ) {
						var students = {};
						email = swig.renderFile( __dirname + '/views/email.swig', { name: course.contact.name, students: user_result } );
					}

					item_results.sort( function( a, b ) {
						if ( a.owner.name < b.owner.name ) return -1;
						if ( a.owner.name > b.owner.name ) return 1;
						return 0;
					} );

					res.render( 'course', { course: course, users: users, email: email, items: item_results } );
				} );
			} );
		}
	} )
} )

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Users.find( function( err, users ) {
		Courses.findOne( { _id: req.params.id }, function( err, course ) {
			if ( course == undefined ) {
				req.flash( 'danger', 'Course not found' );
				res.redirect( app.mountpath );
			} else {
				res.render( 'edit', { course: course, users: users } );
			}
		} )
	} )
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The course requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	Courses.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			contact: req.body.contact ? req.body.contact : null
		}
	} ).then( function ( status ) {
		if ( status.n == 1 ) {
			req.flash( 'success', 'Course updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.flash( 'warning', 'Course was not changed' );
		} else {
			req.flash( 'danger', 'There was an error updating the course' );
		}
		res.redirect( app.mountpath + '/' + req.params.id );
	}, function ( status ) {
		req.flash( 'danger', 'There was an error updating the course' );
		res.redirect( app.mountpath + '/' + req.params.id );
	} );
} )

module.exports = function( config ) { return app; };
