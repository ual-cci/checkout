var __home = __dirname + "/../..";
var __config = __home + '/config/config.json';
var __src = __home + '/src';
var __js = __src + '/js';

var config = require( __config );

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Items = db.Items,
	Groups = db.Groups,
	Departments = db.Departments,
	Printers = db.Printers,
	ObjectId = db.ObjectId;

var Print = require( __js + '/print' );

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Groups.find( function( err, groups ) {
		Departments.find( function( err, departments ) {
			var filter = {};
			var total = 0;
			if ( req.query.department ) filter.department = req.query.department;
			if ( req.query.group ) filter.group = req.query.group;
			if ( req.query.department == undefined && req.query.group == undefined ) {
				res.render( 'items', {
					items: [],
					departments: departments,
					selectedDepartment: req.query.department,
					groups: groups,
					selectedGroup: req.query.group,
					total: 0
				} );
			} else {
				Items.find( filter ).populate( 'group' ).populate( 'department' ).populate( 'transactions.user' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
					items.sort( function( a, b ) {
						if ( a.barcode < b.barcode ) return -1;
						if ( a.barcode > b.barcode ) return 1;
						return 0;
					} )
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
							item.owner = last_transaction.user;
						}

						if ( item.value != null )
							total = total + item.value;
					}

					res.render( 'items', {
						items: items,
						departments: departments,
						selectedDepartment: req.query.department,
						groups: groups,
						selectedGroup: req.query.group,
						total: total
					} );
				} );
			}
		} );
	} );
} );

app.post( '/edit', auth.isLoggedIn, function ( req, res ) {
	if ( req.body.fields ) {
		Items.find( { _id: { $in: req.body.edit } }, function( err, items ) {
			for ( var i = 0; i < items.length; i++ ) {
				item = items[i];
				if ( req.body.fields.indexOf( 'group' ) != -1 && req.body.group != '' )
					item.group = req.body.group;

				if ( req.body.fields.indexOf( 'department' ) != -1 && req.body.department != '' )
					item.department = req.body.department;

				if ( req.body.fields.indexOf( 'notes' ) != -1 && req.body.notes != '' )
					item.notes = req.body.notes;

				if ( req.body.fields.indexOf( 'value' ) != -1 && req.body.value != '' )
					item.value = req.body.value;

				item.save( function( err ) {
					if ( err ) console.log( err );
				} );
			}
			req.flash( 'success', 'Items updated' );
			res.redirect( app.mountpath );
		} );
	} else {
		Groups.find( function( err, groups ) {
			Departments.find( function( err, departments ) {
				Items.find( { _id: { $in: req.body.edit } } ).populate( 'group' ).populate( 'department' ).exec( function( err, items ) {
					items.sort( function( a, b ) {
						if ( a.barcode < b.barcode ) return -1;
						if ( a.barcode > b.barcode ) return 1;
						return 0;
					} )
					res.render( 'edit-multiple', { items: items, groups: groups, departments: departments } );
				} );
			} );
		} );
	}
} );

// Generate items
app.get( '/generate', auth.isLoggedIn, function ( req, res ) {
	Departments.find( function( err, departments ) {
		Groups.find( function( err, groups ) {
			if ( departments.length > 0 ) {
				req.flash( 'warning', 'Generating items cannot be undone, and can cause intense server load and result in generating large numbers of items that have invalid information' )
				res.render( 'generate', { departments: departments, groups: groups, item: {} } );
			} else {
				req.flash( 'warning', 'Create at least one department before creating items' )
				res.redirect( app.mountpath );
			}
		} );
	} );
} )

app.post( '/generate', auth.isLoggedIn, function( req, res ) {
	var start = parseInt( req.body.start );
	var end = parseInt( req.body.end );

	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The items require a name' );
		res.redirect( app.mountpath + '/generate' );
		return;
	} else if ( req.body.prefix == '' ) {
		req.flash( 'danger', 'The items require a barcode prefix' );
		res.redirect( app.mountpath + '/generate' );
		return;
	} else if ( req.body.prefix.length < 3 == null ) {
		req.flash( 'danger', 'The barcode prefix must be longer than 2 characters.' );
		res.redirect( app.mountpath + '/generate' );
		return;
	} else if ( start == '' || start < 1 ) {
		req.flash( 'danger', 'The item numbering must start at or above 1' );
		res.redirect( app.mountpath + '/generate' );
		return;
	} else if ( end == '' || end < 2 ) {
		req.flash( 'danger', 'The item numbering must start at or above 2' );
		res.redirect( app.mountpath + '/generate' );
		return;
	} else if ( end - start > 25 && ! req.body.largeBatch ) {
		req.flash( 'danger', "You can't generate more than 25 items at a time without confirming you want to do this" );
		res.redirect( app.mountpath + '/generate' );
		return;
	} else if ( req.body.department == '' ) {
		req.flash( 'danger', 'The items must be assigned to a department' );
		res.redirect( app.mountpath + '/generate' );
		return;
	}

	var items = [];
	var barcodes = [];

	for ( var i = start; i <= end; i++ ) {
		var item = {
			_id: db.ObjectId(),
			name: req.body.name.trim(),
			barcode: req.body.prefix.toUpperCase(),
			value: req.body.value,
			department: ObjectId( req.body.department ),
			notes: req.body.notes
		}

		if ( req.body.group )
			item.group = ObjectId( req.body.group );

		var index = i.toString();
		if ( i < 10 ) index = '0' + index;
		if ( req.body.suffix ) item.name += " #" + index;
		item.barcode += index.toString();
		barcodes.push( item.barcode );
		items.push( item );
	}

	Items.collection.insert( items, function( err, status ) {
		if ( ! err ) {
			req.flash( 'success', status.result.n + ' items created' );
			if ( req.user.printer ) {
				Print.labels( barcodes, req.user.printer.url );
				req.flash( 'info', 'Labels printed to ' + req.user.printer.name );
			} else {
				req.flash( 'warning', 'No printer configured' );
			}
			res.redirect( app.mountpath );
		} else {
			if ( err.code == 11000 ) {
				req.flash( 'danger', 'One or more barcodes generated by this range were not unique' );
				res.redirect( app.mountpath + '/generate' );
			}
		}
	} );
} )

// Create item
app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	Departments.find( function( err, departments ) {
		Groups.find( function( err, groups ) {
			if ( departments.length > 0 ) {
				res.render( 'create', { item: null, departments: departments, groups: groups } );
			} else {
				req.flash( 'warning', 'Create at least one department before creating items' )
				res.redirect( app.mountpath );
			}
		} );
	} );
} )

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	var item = {
		_id: db.ObjectId(),
		name: req.body.name,
		barcode: req.body.barcode.toUpperCase(),
		value: req.body.value,
		department: ObjectId( req.body.department ),
		notes: req.body.notes
	}
	console.log( item );
	if ( req.body.group )
		item.group = ObjectId( req.body.group );

	if ( item.name == '' ) {
		req.flash( 'danger', 'The item requires a name' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( item.barcode == '' ) {
		req.flash( 'danger', 'The item requires a unique barcode' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( item.department == '' ) {
		req.flash( 'danger', 'The item must be assigned to a department' );
		res.redirect( app.mountpath + '/create' );
		return;
	}

	new Items( item ).save( function ( err ) {
		if ( ! err ) {
			req.flash( 'success', 'Item created' );
			if ( req.user.printer ) {
				Print.label( req.body.barcode.toUpperCase(), req.user.printer.url );
				req.flash( 'info', 'Label printed to ' + req.user.printer.name );
			} else {
				req.flash( 'warning', 'No printer configured' );
			}
			res.redirect( app.mountpath );
		} else {
			if ( err.code == 11000 ) {
				req.flash( 'danger', 'Barcode is not unique' );
				res.redirect( app.mountpath + '/create' );
			}
			console.log( err );
		}
	} );
} )

// List an item
app.get( '/:id', auth.isLoggedIn, function( req, res ) {
	Printers.find( function( err, printers ) {
		Items.findById( req.params.id ).populate( 'transactions.user' ).populate( 'group' ).populate( 'department' ).exec( function( err, item ) {
			if ( item == undefined ) {
				req.flash( 'danger', 'Item not found' );
				res.redirect( app.mountpath );
			} else {
				res.render( 'item', { item: item, printers: printers } );
			}
		} );
	} );
} )

// Reprint an item
app.get( '/:id/label', auth.isLoggedIn, function( req, res ) {
	Items.findById( req.params.id,  function( err, item ) {
		if ( item ) {
			if ( req.query.printer != null ) {
				Printers.findById( req.query.printer, function( err, printer ) {
					if ( printer != undefined ) {
						Print.label( item.barcode, printer.url );
						req.flash( 'info', 'Label printed to ' + printer.name );
						if ( req.get( 'referer' ) && req.get( 'referer' ).indexOf( 'items/' + req.params.id ) == -1 ) {
							res.redirect( app.mountpath );
						} else {
							res.redirect( app.mountpath + '/' + item._id.toString() );
						}
					} else {
						req.flash( 'warning', 'Invalid printer' );
						res.redirect( app.mountpath );
					}
				} )
			} else {
				if ( req.user.printer ) {
					Print.label( item.barcode, req.user.printer.url );
					req.flash( 'info', 'Label printed to ' + req.user.printer.name );
					res.redirect( '/' );
				} else {
					req.flash( 'danger', 'Item not found' );
					res.redirect( app.mountpath );
				}
			}
		} else {
			req.flash( 'danger', 'Item not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

// Edit item form
app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Items.findById( req.params.id ).exec( function( err, item ) {
		if ( item == undefined ) {
			req.flash( 'danger', 'Item not found' );
			res.redirect( app.mountpath );
		} else {
			Groups.find( function( err, groups ) {
				Departments.find( function( err, departments ) {
					res.render( 'edit', { item: item, groups: groups, departments: departments } );
				} );
			} );
		}
	} );
} )

// Edit item handler
app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	var item = {
		name: req.body.name,
		barcode: req.body.barcode,
		department: req.body.department,
		value: req.body.value,
		notes: req.body.notes
	};

	if ( req.body.group != '' ) {
		item.group = req.body.group;
	} else {
		item.group = null;
	}

	Items.update( { _id: req.params.id }, { $set: item } ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.flash( 'success', 'Item updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.flash( 'warning', 'Item was not changed' );
		} else {
			req.flash( 'danger', 'There was an error updating the item' );
		}
		res.redirect( app.mountpath + '/' + req.params.id );
	}, function ( status ) {
		req.flash( 'danger', 'There was an error updating the item' );
		res.redirect( app.mountpath + '/' + req.params.id );
	} );
} )

module.exports = function( config ) { return app; };
