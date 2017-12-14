var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Items = db.Items,
	Groups = db.Groups;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Groups.find().sort( 'name' ).exec(  function( err, groups ) {
		res.render( 'groups', { groups: groups } );
	} )
} );

app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	res.render( 'create', { group: {} } );
} )

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The group requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	new Groups( {
		_id: db.ObjectId(),
		name: req.body.name,
		limiter: req.body.limiter,
	} ).save( function ( err ) {
		req.flash( 'success', 'Group created' );
		res.redirect( app.mountpath );
	} );
} )

app.get( '/:id', auth.isLoggedIn, function( req, res ) {
	Groups.findOne( { _id: req.params.id }, function( err, group ) {
		if ( group == undefined ) {
			req.flash( 'danger', 'Group not found' );
			res.redirect( app.mountpath );
		} else {
			Items.find( { group: req.params.id } )
				.populate( 'department' )
				.sort( { 'name': 1, 'barcode': 1 } )
				.exec( function( err, items ) {
				res.render( 'group', {
					group: group,
					items: items
				} );
			} );
		}
	} )
} )

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Groups.findOne( { _id: req.params.id }, function( err, group ) {
		if ( group == undefined ) {
			req.flash( 'danger', 'Group not found' );
			res.redirect( app.mountpath );
		} else {
			res.render( 'edit', { group: group } );
		}
	} )
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The group requires a name' );
		res.redirect( app.mountpath + '/edit' );
	}

	Groups.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			limiter: req.body.limiter
		}
	} ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.flash( 'success', 'Group updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.flash( 'warning', 'Group was not changed' );
		} else {
			req.flash( 'danger', 'There was an error updating the group' );
		}
		res.redirect( app.mountpath + '/' + req.params.id );
	}, function ( status ) {
		req.flash( 'danger', 'There was an error updating the group' );
		res.redirect( app.mountpath + '/' + req.params.id );
	}  );
} )

module.exports = function( config ) { return app; };
