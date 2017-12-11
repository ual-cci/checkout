var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var pug = require( 'pug' );

var db = require( __js + '/database' ),
	Years = db.Years,
	Items = db.Items,
	Users = db.Users;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Years.find().sort( 'name' ).exec( function( err, years ) {
		res.render( 'years', { years: years } );
	} )
} );

app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	res.render( 'create' );
} );

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The year requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	new Years( {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
	} ).save( function ( err ) {
		req.flash( 'success', 'Year created' );
		res.redirect( app.mountpath );
	} );
} )

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Years.findOne( { _id: req.params.id }, function( err, year ) {
		if ( year ) {
			res.render( 'edit', { year: year } );
		} else {
			req.flash( 'danger', 'Course not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The year requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	Years.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name
		}
	} ).then( function ( status ) {
		if ( status.n == 1 ) {
			req.flash( 'success', 'Year updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.flash( 'warning', 'Year was not changed' );
		} else {
			req.flash( 'danger', 'There was an error updating the year' );
		}
		res.redirect( app.mountpath + '/' + req.params.id + '/edit' );
	}, function ( status ) {
		req.flash( 'danger', 'There was an error updating the year' );
		res.redirect( app.mountpath + '/' + req.params.id + '/edit' );
	} );
} )

module.exports = function( config ) { return app; };
