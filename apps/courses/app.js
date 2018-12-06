var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var pug = require( 'pug' );

var db = require( __js + '/database' )(),
	Courses = db.Courses,
	Users = db.Users;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Courses.get( function( err, courses ) {
		res.render( 'courses', { courses: courses } );
	} )
} );

app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	Users.get( function( err, users ) {
		res.render( 'create', { course: {}, users: users } );
	} );
} );

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The course requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	var course = {
		name: req.body.name
	}

	if ( parseInt( req.body.contact ) ) {
		course.contact_id = Number( req.body.contact );
	}

	Courses.create( course, function ( err ) {
		if ( err ) {
			req.flash( 'danger', 'Error creating course' );
			res.redirect( app.mountpath );
		} else {
			req.flash( 'success', 'Course created' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Users.get( function( err, users ) {
		Courses.getById( req.params.id, function( err, course ) {
			if ( course == undefined ) {
				req.flash( 'danger', 'Course not found' );
				res.redirect( app.mountpath );
			} else {
				res.render( 'edit', {
					course: course,
					users: users
				} );
			}
		} )
	} )
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The course requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	var course = {
		name: req.body.name
	}

	if ( parseInt( req.body.contact ) ) {
		course.contact_id = Number( req.body.contact );
	} else {
		course.contact_id = null;
	}

	Courses.update( req.params.id, course, function ( err ) {
		if ( err ) {
			console.log( err );
			req.flash( 'danger', 'Error updating course' );
			res.redirect( app.mountpath );
		} else {
			req.flash( 'success', 'Course updated' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Courses.get( function( err, courses ) {
		var selected = courses.filter( function( course ) {
			return ( course.id == req.params.id ? course : null );
		} );

		if ( selected[0] ) selected = selected[0];

		var list = courses.filter( function( course ) {
			if ( course.id == req.params.id ) course.disabled = true;
			return course;
		} );

		if ( selected ) {
			res.render( 'confirm-remove', {
				selected: selected,
				courses: list
			} );
		} else {
			req.flash( 'danger', 'Course not found' );
			res.redirect( app.mountpath );
		}
	} )
} )

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Courses.getById( req.params.id, function( err, course_to_remove ) {
		if ( ! course_to_remove ) {
			req.flash( 'danger', 'Course not found' );
			res.redirect( app.mountpath );
			return;
		}
		Courses.getById( req.body.course, function( err, course_to_become ) {
			if ( ! course_to_become ) {
				req.flash( 'danger', 'New course not found' );
				res.redirect( app.mountpath );
				return;
			}

			Users.updateCourse( course_to_remove.id, course_to_become.id, function( err ) {
				if ( err ) {
					req.flash( 'danger', 'Could not transfer users to new course' );
					res.redirect( app.mountpath );
					return;
				}

				Courses.remove( course_to_remove.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not remove course' );
						res.redirect( app.mountpath );
						return;
					}

					req.flash( 'success', 'Course deleted and users transferred' );
					res.redirect( app.mountpath );
				} );
			} );
		} );
	} );
} )

module.exports = function( config ) { return app; };
