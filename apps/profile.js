var	express = require( 'express' ),
	app = express(),
	Courses = require( __dirname + '/../models/courses' ),
	Items = require( __dirname + '/../models/items' ),
	Users = require( __dirname + '/../models/users' );


var prefix = 'profile';

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'profiles';
	if ( ! req.session.user ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'Please login' );
		res.redirect( '/login' );
	} else {
		next();
	}
} );

app.get( '/', function( req, res ) {
	Users.findById( req.session.user.id ).populate( 'course' ).exec( function( err, user ) {
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
			res.render( prefix + '/view', { user: user, onloan: onloan, pastloan: pastloan } );
		} );
	} )	
} )

// Edit user
app.get( '/edit', function( req, res ) {
	Users.findOne( { _id: req.session.user.id }, function( err, user ) {
		Courses.find( function( err, courses ) {
			res.render( prefix + '/edit', { courses:courses, user: user } );
		} );
	} )
} )

app.post( '/edit', function( req, res ) {
	var user = {
		name: req.body.name,
		email: req.body.email,
	}

	if ( item.name == '' ) {
		req.add_flash( 'danger', 'The user must have a name' );
		res.redirect( '/' + prefix + '/create' );
		return;
	} else if ( item.email == '' ) {
		req.add_flash( 'danger', 'The user must have an email address' );
		res.redirect( '/' + prefix + '/create' );
		return;
	}

	Users.update( { _id: req.session.user.id }, { $set: user } ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.add_flash( 'success', 'Your profile has been updated updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.add_flash( 'warning', 'Your profile was not changed' );
		} else {
			req.add_flash( 'danger', 'There was an error updating your profile' );
		}
		res.redirect( '/' + prefix );
	}, function ( status ) {
		req.add_flash( 'danger', 'There was an error updating your profile' );
		res.redirect( '/' + prefix );
	} );
} )

module.exports = app;
module.exports.path = '/' + prefix;