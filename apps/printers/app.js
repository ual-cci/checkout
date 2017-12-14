var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Printers = db.Printers,
	Users = db.Users;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Printers.find().sort( 'name' ).exec(  function( err, printers ) {
		res.render( 'printers', { printers: printers } );
	} )
} );

app.get( '/new', auth.isLoggedIn, function ( req, res ) {
	res.render( 'new', { printer: {} } );
} );

app.post( '/new', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The printer requires a name' );
		res.redirect( app.mountpath + '/new' );
	}

	if ( req.body.url == '' ) {
		req.flash( 'danger', 'The printer requires a URL' );
		res.redirect( app.mountpath + '/new' );
	}

	new Printers( {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
		url: req.body.url
	} ).save( function ( err ) {
		req.flash( 'success', 'Printer created' );
		res.redirect( app.mountpath );
	} );
} )

// Edit
app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Printers.findOne( { _id: req.params.id }, function( err, printer ) {
		if ( printer == undefined ) {
			req.flash( 'danger', 'Printers not found' );
			res.redirect( app.mountpath );
		} else {
			res.render( 'edit', { printer: printer } );
		}
	} )
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The printer requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	if ( req.body.url == '' ) {
		req.flash( 'danger', 'The printer requires a URL' );
		res.redirect( app.mountpath + '/create' );
	}

	Printers.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			url: req.body.url
		}
	} ).then( function ( status ) {
		if ( status.n == 1 ) {
			req.flash( 'success', 'Printer updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.flash( 'warning', 'Printer was not changed' );
		} else {
			req.flash( 'danger', 'There was an error updating the printer' );
		}
		res.redirect( app.mountpath );
	}, function ( status ) {
		req.flash( 'danger', 'There was an error updating the printer' );
		res.redirect( app.mountpath );
	} );
} )

module.exports = function( config ) { return app; };
