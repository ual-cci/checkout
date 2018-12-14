var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' )(),
	Groups = db.Groups,
	Items = db.Items;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Groups.get( function( err, groups ) {
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

	var group = {
		name: req.body.name
	}

  if ( req.body.limiter ) group.limiter = req.body.limiter;

	Groups.create( group, function( err, group ) {
		if ( err ) {
			req.flash( 'danger', `Error creating group: ${err.detail}` );
			res.redirect( app.mountpath );
		} else {
			req.flash( 'success', 'Group created' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Groups.getById( req.params.id, function( err, group ) {
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

	Groups.update( req.params.id, {
		name: req.body.name,
		limiter: req.body.limiter ? req.body.limiter : null
	}, function( err ) {
		if ( err ) {
			req.flash( 'danger', 'There was an error updating the group' );
			res.redirect( app.mountpath + '/' + req.params.id + '/edit' );
		} else {
			req.flash( 'success', 'Group updated' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Groups.get( function( err, groups ) {
		var selected = groups.filter( function( group ) {
			return ( group.id == req.params.id ? group : null );
		} );

		if ( selected[0] ) selected = selected[0];

		var list = groups.filter( function( group ) {
			if ( group.id == req.params.id ) group.disabled = true;
			return group;
		} );

		if ( selected ) {
			res.render( 'confirm-remove', {
				selected: selected,
				groups: list
			} );
		} else {
			req.flash( 'danger', 'Groups not found' );
			res.redirect( app.mountpath );
		}
	} )
} )

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Groups.getById( req.params.id, function( err, group_to_remove ) {
		if ( ! group_to_remove ) {
			req.flash( 'danger', 'Group not found' );
			res.redirect( app.mountpath );
			return;
		}

		if ( req.body.group ) {
			Groups.getById( req.body.group, function( err, group_to_become ) {
				if ( ! group_to_become ) {
					req.flash( 'danger', 'New group not found' );
					res.redirect( app.mountpath );
					return;
				}

				Items.updateGroup( group_to_remove.id, group_to_become.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not transfer items to new group' );
						res.redirect( app.mountpath );
						return;
					}

					Groups.remove( group_to_remove.id, function( err ) {
						if ( err ) {
							req.flash( 'danger', 'Could not remove group' );
							res.redirect( app.mountpath );
							return;
						}

						req.flash( 'success', 'Group deleted and items transferred' );
						res.redirect( app.mountpath );
					} );
				} );
			} );
		} else {
			Items.updateGroup( group_to_remove.id, null, function( err ) {
				if ( err ) {
					req.flash( 'danger', 'Could not remove group from existing items' );
					res.redirect( app.mountpath );
					return;
				}

				Groups.remove( group_to_remove.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not remove group' );
						res.redirect( app.mountpath );
						return;
					}

					req.flash( 'success', 'Group removed from items and group deleted ' );
					res.redirect( app.mountpath );
				} );
			} );
		}
	} );
} )

module.exports = function( config ) { return app; };
