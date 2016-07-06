var	express = require( 'express' ),
	app = express(),
	Items = require( __dirname + '/../models/items' ),
	Groups = require( __dirname + '/../models/groups' );

var prefix = 'groups';

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'items';
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
	Groups.find( function( err, groups ) {
		res.render( prefix + '/groups', { groups: groups } );
	} )
} )

// Create
app.get( '/create', function ( req, res ) {
	res.render( prefix + '/create', { group: { name: '' } } );
} )

app.post( '/create', function( req, res ) {
	if ( req.body.name == '' ) {
		req.add_flash( 'danger', 'The group requires a name' );
		res.redirect( '/' + prefix + '/create' );
	}

	new Groups( {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
		limiter: req.body.limiter,
	} ).save( function ( err ) {
		req.add_flash( 'success', 'Group created' );
		res.redirect( '/' + prefix );
	} );
} )

// View
app.get( '/:id', function( req, res ) {
	Groups.findOne( { _id: req.params.id }, function( err, group ) {
		if ( group == undefined ) {
			req.add_flash( 'danger', 'Group not found' );
			res.redirect( '/' + prefix );
		} else {
			Items.find( { group: req.params.id }, function( err, items ) {
				res.render( prefix + '/group', { group: group, items: items } );
			} );
		}
	} )
} )

// Edit
app.get( '/:id/edit', function( req, res ) {
	Groups.findOne( { _id: req.params.id }, function( err, group ) {
		if ( group == undefined ) {
			req.add_flash( 'danger', 'Group not found' );
			res.redirect( '/' + prefix );
		} else {
			res.render( prefix + '/edit', { group: group } );
		}
	} )
} )

app.post( '/:id/edit', function( req, res ) {
	if ( req.body.name == '' ) {
		req.add_flash( 'danger', 'The group requires a name' );
		res.redirect( '/' + prefix + '/edit' );
	}

	Groups.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			limiter: req.body.limiter
		}
	} ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.add_flash( 'success', 'Group updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.add_flash( 'warning', 'Group was not changed' );
		} else {
			console.log( status );
			req.add_flash( 'danger', 'There was an error updating the group' );
		}
		res.redirect( '/' + prefix + '/' + req.params.id );
	}, function ( status ) {
		console.log( status );
		req.add_flash( 'danger', 'There was an error updating the group' );
		res.redirect( '/' + prefix + '/' + req.params.id );
	}  );
} )

module.exports = app;
module.exports.path = '/' + prefix;
