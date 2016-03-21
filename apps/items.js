var prefix = 'items';

var	express = require( 'express' ),
	app = express(),
	Items = require( __dirname + '/../models/items' ),
	Departments = require( __dirname + '/../models/departments' ),
	ObjectId = require( 'mongoose' ).Schema.Types.ObjectId;

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'items';
	if ( ! req.session.user ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'Please login' );
		res.redirect( '/login' );
	} else if ( ! req.session.user.isStaff ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'You must be staff to access this function' );
		res.redirect( '/' );
	} else {
		next();
	}
} );

// Index
app.get( '/', function ( req, res ) {
	Items.find().populate( 'department' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
		if ( req.session.user.isStaff ) {
			res.render( prefix + '/items', { items: items } );
		} else {
			res.render( prefix + '/items-minimal', { items: items } );
		}
	} )
} );

// Audit
app.get( '/audit', function ( req, res ) {
	res.render( prefix + '/audit' );
} );

// Audit item
app.post( '/audit', function( req, res ) {
	var val = /([A-Z]{2,4})  ?([0-9]{2})/.exec( req.body.barcode.toUpperCase() );
	if ( val ) {
		barcode = val[1] + ' ' + val[2];
		Items.update( { barcode: barcode.toUpperCase() }, {
			$push: {
				transactions: {
					date: new Date(),
					user: req.session.user.id,
					status: 'audited'
				}
			}
		} ).then ( function ( status ) {
			if ( status.n == 1 ) {
				req.add_flash( 'success', 'Item audited' );
			} else {
				req.add_flash( 'danger', 'Item not found' );
			}
			res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
		}, function ( err ) {
			req.add_flash( 'danger', 'Unknown item' );
			res.redirect( '/items/audit' );
		} );
	} else {
		req.add_flash( 'danger', 'Item barcode format invalid' );
		res.redirect( '/items/audit' );	
	}
} )

// Report
app.get( '/report', function( req, res ) {
	Departments.find( function( err, departments ) {
		var filter = {};
		if ( req.query.department ) filter.department = req.query.department;
		Items.find( filter ).populate( 'department' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
			var audited = [],
				missing = [],
				broken = [],
				onloan = [],
				reserved = [];

			for ( i in items ) {
				var item = items[i];

				if ( item.audited ) {
					audited.push( item );
				} else {
					missing.push( item );
				}

				var status = item.status;

				if ( status == 'broken' ) {
					broken.push( item );
				}

				if ( status == 'on-loan' ) {
					onloan.push( item );
				}

				if ( status == 'reserved' ) {
					reserved.push( item );
				}
			}

			res.render( prefix + '/report', {
				audited: audited,
				broken: broken,
				reserved: reserved,
				onloan: onloan,
				missing: missing,
				departments: departments,
				selectedDepartment: req.query.department
			} );
		} )
	} )
} );

// Generate items
app.get( '/generate', function ( req, res ) {
	Departments.find( function( err, departments ) {
		if ( departments.length > 0 ) {
			req.add_flash( 'warning', 'Generating items cannot be undone, and can cause intense server load and result in generating large numbers of items that have invalid information' )
			res.render( prefix + '/generate', { departments: departments } );
		} else {
			req.add_flash( 'warning', 'Create at least one department before creating items' )
			res.redirect( '/' + prefix );
		}
	} );
} )

app.post( '/generate', function( req, res ) {
	var start = parseInt( req.body.start );
	var end = parseInt( req.body.end );

	if ( req.body.name == '' ) {
		req.add_flash( 'danger', 'The items require a name' );
		res.redirect( '/' + prefix + '/generate' );
		return;
	} else if ( req.body.prefix == '' ) {
		req.add_flash( 'danger', 'The items require a barcode prefix' );
		res.redirect( '/' + prefix + '/generate' );
		return;
	} else if ( req.body.prefix.trim().match( /^[A-Z]{3,4}$/i ) == null ) {
		req.add_flash( 'danger', 'The barcode prefix must contain 3 or 4 letters only.' );
		res.redirect( '/' + prefix + '/generate' );
		return;
	} else if ( start == '' || start < 1 ) {
		req.add_flash( 'danger', 'The item numbering must start at or above 1' );
		res.redirect( '/' + prefix + '/generate' );
		return;
	} else if ( end == '' || end < 2 ) {
		req.add_flash( 'danger', 'The item numbering must start at or above 2' );
		res.redirect( '/' + prefix + '/generate' );
		return;
	} else if ( end - start > 25 && ! req.body.largeBatch ) {
		req.add_flash( 'danger', "You can't generate more than 25 items at a time without confirming you want to do this" );
		res.redirect( '/' + prefix + '/generate' );
		return;
	} else if ( req.body.department == '' ) {
		req.add_flash( 'danger', 'The items must be assigned to a department' );
		res.redirect( '/' + prefix + '/generate' );
		return;
	}

	var items = [];

	for ( var i = start; i <= end; i++ ) {
		var item = {
			_id: require('mongoose').Types.ObjectId(),
			name: req.body.name.trim(),
			barcode: req.body.prefix.trim().toUpperCase(),
			value: req.body.value,
			department: req.body.department,
			notes: req.body.notes
		}
		var index = i.toString();
		if ( i < 10 ) index = '0' + index;
		if ( req.body.suffix ) item.name += " #" + index;
		if ( req.body.autoAudit ) {
			item.transactions = [ {
				date: new Date(),
				user: req.session.user.id,
				status: 'audited'
			} ];
		}
		item.barcode += ' ' + index;
		items.push( item );
	}

	Items.collection.insert( items, function( err, status ) {
		if ( ! err ) {
			req.add_flash( 'success', status.result.n + ' items created' );
			res.redirect( '/' + prefix );
		} else {
			if ( err.code == 11000 ) {
				req.add_flash( 'danger', 'One or more barcodes generated by this range were not unique' );
				res.redirect( '/' + prefix + '/generate' );
			}
		}
	} );
} )

// Create item
app.get( '/create', function ( req, res ) {
	Departments.find( function( err, departments ) {
		if ( departments.length > 0 ) {
			res.render( prefix + '/create', { departments: departments } );
		} else {
			req.add_flash( 'warning', 'Create at least one department before creating items' )
			res.redirect( '/' + prefix );
		}
	} );
} )

app.post( '/create', function( req, res ) {
	var item = {
		_id: require('mongoose').Types.ObjectId(),
		name: req.body.name,
		barcode: req.body.barcode.toUpperCase(),
		value: req.body.value,
		department: req.body.department,
		notes: req.body.notes
	}

	if ( item.name == '' ) {
		req.add_flash( 'danger', 'The item requires a name' );
		res.redirect( '/' + prefix + '/create' );
		return;
	} else if ( item.barcode == '' ) {
		req.add_flash( 'danger', 'The item requires a unique barcode' );
		res.redirect( '/' + prefix + '/create' );
		return;
	} else if ( item.department == '' ) {
		req.add_flash( 'danger', 'The item must be assigned to a department' );
		res.redirect( '/' + prefix + '/create' );
		return;
	}

	new Items( item ).save( function ( err ) {
		if ( ! err ) {
			req.add_flash( 'success', 'Item created' );
			res.redirect( '/' + prefix );
		} else {
			if ( err.code == 11000 ) {
				req.add_flash( 'danger', 'Barcode is not unique' );
				res.redirect( '/' + prefix + '/create' );
			}
		}
	} );
} )

// List an item
app.get( '/:id', function( req, res ) {
	Items.findById( req.params.id ).populate( 'transactions.user' ).populate( 'department' ).exec( function( err, item ) {
		if ( item == undefined ) {
			req.add_flash( 'danger', 'Item not found' );
			res.redirect( '/' + prefix );
		} else {
			res.render( prefix + '/item', { item: item } );
		}
	} );
} )

// Issue item
app.post( '/:id/issue', function( req, res ) {
	Items.findById( req.params.id, function( err, item ) {
		switch ( item.status ) {
			case 'on-loan':
				req.add_flash( 'danger', 'Item on loan to another user' );
				res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
				break;
			case 'broken':
				req.add_flash( 'warning', 'Item is currently broken' );
				res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
				break;
			case 'new':
				req.add_flash( 'warning', 'Item has not yet been activated, audit item before issuing it' );
				res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
				break;
			case 'reserved':
			case 'available':
				Users.findOne( { barcode: req.body.user }, function( err, userData ) {
					if ( item.status == 'reserved' ) {
						if ( userData.id != item.transactions[ item.transactions.length - 1 ].user ) {
							req.add_flash( 'warning', 'Item is currently reserved by another user' );
							res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
							return;
						}
					}
					if ( userData != null ) {
						if ( req.session.user.isStaff || req.session.user.id == userData._id ) {
							Items.update( { _id: item._id }, {
								$push: {
									transactions: {
										date: new Date(),
										user: userData._id,
										status: 'loaned'
									}
								}
							}, function ( err ) {
								req.add_flash( 'success', 'Item checked out to user' );
								res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
							} );
						} else {
							req.add_flash( 'danger', 'Only staff can issue items to other users' );
							res.redirect( '/items' );
						}
					} else {
						req.add_flash( 'danger', 'Invalid user' );
						res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
					}
				} );
				break;
			default:
				req.add_flash( 'danger', 'Unknown error');
				res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
				break;
		}
	} );
} )

// Return item
app.get( '/:id/return', function( req, res ) {
	Items.findById( req.params.id, function( err, item ) {
		if ( item.status == 'available' ) {
			req.add_flash( 'warning', 'Item already returned' );
			res.redirect( req.query.modal ? req.query.modal : '/' + prefix + '/' + req.params.id );
			return;
		} else if ( item.status == 'new' ) {
			req.add_flash( 'warning', 'Item has not yet been activated, audit item before issuing it' );
			res.redirect( req.query.modal ? req.query.modal : '/' + prefix + '/' + req.params.id );
			return;
		}
		Items.update( { _id: req.params.id }, {
			$push: {
				transactions: {
					date: new Date(),
					user: req.session.user.id,
					status: 'returned'
				}
			}
		}, function ( err ) {
			req.add_flash( 'success', 'Item returned');
			res.redirect( req.query.modal ? req.query.modal : '/' + prefix + '/' + req.params.id );
		} );
	} );
} )

// Reserve item
app.post( '/:id/reserve', function( req, res ) {
	Items.findById( req.params.id, function( err, item ) {
		if ( item == undefined ) {
			req.add_flash( 'danger', 'Item not found' );
			res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
			return;
		}

		if ( item.status == 'reserved' ) {
			req.add_flash( 'warning', 'Item already reserved' );
			res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
			return;
		} else if ( item.status == 'new' ) {
			req.add_flash( 'warning', 'Item has not yet been activated, audit item before issuing it' );
			res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
			return;
		} else if ( item.status == 'broken' ) {
			req.add_flash( 'warning', 'Item is broken, return it before issuing it' );
			res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
			return;
		}
		
		Users.findOne( { barcode: req.body.user }, function( err, user ) {
			Items.update( { _id: req.params.id }, {
				$push: {
					transactions: {
						date: new Date(),
						user: user._id,
						status: 'reserved'
					}
				}
			} ).then( function ( status ) {
				if ( status.n == 1 ) {
				req.add_flash( 'success', 'Item reserved');
			} else {
				req.add_flash( 'danger', 'There was an error updating the item' );
			}
			res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
			}, function ( status ) {
				req.add_flash( 'danger', 'There was an error updating the item' );
				res.redirect( req.body.modal ? req.body.modal : '/' + prefix + '/' + req.params.id );
			} );
		} );
	} );
} )

// Mark as broken
app.get( '/:id/broken', function( req, res ) {
	Items.findById( req.params.id, function( err, item ) {
		if ( item.status == 'broken' ) {
			req.add_flash( 'warning', 'Item already marked as broken' );
			res.redirect( req.query.modal ? req.query.modal : '/' + prefix + '/' + req.params.id );
			return;
		} else if ( item.status == 'new' ) {
			req.add_flash( 'warning', 'Item has not yet been activated, audit item before issuing it' );
			res.redirect( req.query.modal ? req.query.modal : '/' + prefix + '/' + req.params.id );
			return;
		}
		Items.update( { _id: req.params.id }, {
			$push: {
				transactions: {
					date: new Date(),
					user: req.session.user.id,
					status: 'broken'
				}
			}
		} ).then( function ( status ) {
			if ( status.n == 1 ) {
				req.add_flash( 'success', 'Item marked as broken');
				res.redirect( req.query.modal ? req.query.modal : '/' + prefix + '/' + req.params.id );
			} else {
				req.add_flash( 'danger', 'There was an error updating the item' );
			}
			res.redirect( '/' + prefix + '/' + req.params.id );
		}, function ( status ) {
			req.add_flash( 'danger', 'There was an error updating the item' );
			res.redirect( '/' + prefix + '/' + req.params.id );
		} );
	} );
} )

// Audit item
app.get( '/:id/audit', function( req, res ) {
	Items.update( { _id: req.params.id }, {
		$push: {
			transactions: {
				date: new Date(),
				user: req.session.user.id,
				status: 'audited'
			}
		}
	} ).then( function ( status ) {
		if ( status.n == 1 ) {
			req.add_flash( 'success', 'Item marked as audited');
			res.redirect( req.query.modal ? req.query.modal : '/' + prefix + '/' + req.params.id );
		} else {
			req.add_flash( 'danger', 'There was an error updating the item' );
		}
		res.redirect( '/' + prefix + '/' + req.params.id );
	}, function ( status ) {
		req.add_flash( 'danger', 'There was an error updating the item' );
		res.redirect( '/' + prefix + '/' + req.params.id );
	} );
} )

// Edit item form
app.get( '/:id/edit', function( req, res ) {
	Items.findById( req.params.id ).exec( function( err, item ) {
		if ( item == undefined ) {
			req.add_flash( 'danger', 'Item not found' );
			res.redirect( '/' + prefix );
		} else {
			Departments.find( function( err, departments ) {
				res.render( prefix + '/edit', { item: item, departments: departments } );
			} );
		}
	} );
} )

// Edit item handler
app.post( '/:id/edit', function( req, res ) {
	Items.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
			barcode: req.body.barcode,
			department: req.body.department,
			value: req.body.value,
			notes: req.body.notes
		}
	} ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.add_flash( 'success', 'Item updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.add_flash( 'warning', 'Item was not changed' );
		} else {
			req.add_flash( 'danger', 'There was an error updating the item' );
		}
		res.redirect( '/' + prefix + '/' + req.params.id );
	}, function ( status ) {
		req.add_flash( 'danger', 'There was an error updating the item' );
		res.redirect( '/' + prefix + '/' + req.params.id );
	} );
} )

module.exports = app;
module.exports.path = '/' + prefix;