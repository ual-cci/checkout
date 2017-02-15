var prefix = 'items';

var config = require( '../config/config.json' );

var	express = require( 'express' ),
	app = express();

var Items = require( __dirname + '/../models/items' ),
	Groups = require( __dirname + '/../models/groups' ),
	Departments = require( __dirname + '/../models/departments' ),
	ObjectId = require( 'mongoose' ).Schema.Types.ObjectId;

var PDFDocument = require( 'pdfkit' );
var bwipjs = require( 'bwip-js' );
var ipp = require( 'ipp' );
var buffer = [];

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'items';
	if ( ! req.isAuthenticated() ) {
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
		Departments.find( function( err, departments ) {
			var filter = {};
			if ( req.query.department ) filter.department = req.query.department;
			if ( req.query.group ) filter.group = req.query.group;
			Items.find( filter ).populate( 'group' ).populate( 'department' ).populate( 'transactions.user' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
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
				}

				res.render( prefix + '/items', {
					items: items,
					departments: departments,
					selectedDepartment: req.query.department,
					groups: groups,
					selectedGroup: req.query.group
				} );
			} );
		} );
	} );
} );

// Audit
app.get( '/audit', function ( req, res ) {
	res.locals.currentModule = 'audit';
	res.render( prefix + '/audit' );
} );

// Generate items
app.get( '/generate', function ( req, res ) {
	Departments.find( function( err, departments ) {
		Groups.find( function( err, groups ) {
			if ( departments.length > 0 ) {
				req.add_flash( 'warning', 'Generating items cannot be undone, and can cause intense server load and result in generating large numbers of items that have invalid information' )
				res.render( prefix + '/generate', { departments: departments, groups: groups, item: {} } );
			} else {
				req.add_flash( 'warning', 'Create at least one department before creating items' )
				res.redirect( '/' + prefix );
			}
		} );
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
	var barcodes = [];

	for ( var i = start; i <= end; i++ ) {
		var item = {
			_id: require('mongoose').Types.ObjectId(),
			name: req.body.name.trim(),
			barcode: req.body.prefix.trim().toUpperCase(),
			value: req.body.value,
			department: req.body.department,
			notes: req.body.notes
		}

		if ( req.body.group )
			item.group = req.body.group;

		var index = i.toString();
		if ( i < 10 ) index = '0' + index;
		if ( req.body.suffix ) item.name += " #" + index;
		if ( req.body.autoAudit ) {
			item.transactions = [ {
				date: new Date(),
				user: req.user._id,
				status: 'audited'
			} ];
		}
		item.barcode += ' ' + index;
		barcodes.push( item.barcode );
		items.push( item );
	}

	Items.collection.insert( items, function( err, status ) {
		if ( ! err ) {
			req.add_flash( 'success', status.result.n + ' items created' );
			res.redirect( '/' + prefix );

			if ( req.body.print )
				processPrint( barcodes );
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
		Groups.find( function( err, groups ) {
			if ( departments.length > 0 ) {
				res.render( prefix + '/create', { item: {}, departments: departments, groups: groups } );
			} else {
				req.add_flash( 'warning', 'Create at least one department before creating items' )
				res.redirect( '/' + prefix );
			}
		} );
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
	if ( req.body.group )
		item.group = req.body.group;

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

			if ( req.body.print )
				processPrint( [ req.body.barcode.toUpperCase() ] );
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
	Items.findById( req.params.id ).populate( 'transactions.user' ).populate( 'group' ).populate( 'department' ).exec( function( err, item ) {
		if ( item == undefined ) {
			req.add_flash( 'danger', 'Item not found' );
			res.redirect( '/' + prefix );
		} else {
			res.render( prefix + '/item', { item: item } );
		}
	} );
} )

// Reprint an item
app.get( '/:id/label', function( req, res ) {
	if ( config.label_printer == undefined ) {
		req.add_flash( 'info', 'No label printer available' );
		res.redirect( '/' + prefix );
	} else {
		Items.findById( req.params.id,  function( err, item ) {
			if ( item == undefined ) {
				req.add_flash( 'danger', 'Item not found' );
				res.redirect( '/' + prefix );
			} else {
				processPrint( [ item.barcode ] );
				req.add_flash( 'success', 'Label printed' );
				res.redirect( '/' + prefix + '/' + item._id.toString() );
			}
		} );
	}
} )

// Edit item form
app.get( '/:id/edit', function( req, res ) {
	Items.findById( req.params.id ).exec( function( err, item ) {
		if ( item == undefined ) {
			req.add_flash( 'danger', 'Item not found' );
			res.redirect( '/' + prefix );
		} else {
			Groups.find( function( err, groups ) {
				Departments.find( function( err, departments ) {
					res.render( prefix + '/edit', { item: item, groups: groups, departments: departments } );
				} );
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
			group: req.body.group,
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

function processPrint( codes ) {
	var doc = new PDFDocument( {
		size: [ pt(12), pt(50) ],
		layout: 'portrait',
		margin: 0,
		autoFirstPage: false
	} );

	var barcodes = [];
	for ( c in codes ) {
		codes[c] = codes[c].toUpperCase();

		var regex = /([A-Z]{2,4}) ([0-9]{2})/.exec( codes[c] );

		if ( regex )
			barcodes.push( addLabel( doc, codes[c] ) )
	}

	Promise.all( barcodes ).then( function() {
		doc.end();
	} );

	doc.on( 'data', buffer.push.bind( buffer ) );

	doc.on( 'end', function() {
		print( buffer );
	} );
}

function addLabel( doc, barcode ) {
	return new Promise( function( resolve, reject ) {
		generateBarcodeImage( barcode ).then( function( png ) {
			var page = doc.addPage();
			page.fontSize( 8 );
			page.text( barcode, pt(1), pt(35), {
				width: pt(10),
				align: 'center'
			} );
			page.image( png,  pt(1), pt(2), {
				width: pt(10),
				height: pt(30)
			} );
			resolve( page );
		} )
	} );
}

function generateBarcodeImage( barcode ) {
	return new Promise( function ( resolve, reject ) {
		bwipjs.toBuffer( {
			bcid: 'code39',
			text: barcode,
			height: 10,
			width: 30,
			rotate: 'R',
			monochrome: true
		}, function( err, png ) {
			if ( err ) return reject( err );
			return resolve( png );
		} );
	} );
}

function print( buffer ) {
	var file = {
		"operation-attributes-tag": {
			"requesting-user-name": config.name,
			"job-name": "Barcode Labels",
			"requesting-user-name": "Checkout",
			"document-format": "application/pdf"
		},
		data: Buffer.concat( buffer )
	};

	var printer = ipp.Printer( config.label_printer );
	printer.execute( "Print-Job", file, function ( err, res ) {
		delete buffer;
	});
}

function pt( mm ) {
	return mm * 2.834645669291;
}

module.exports = app;
module.exports.path = '/' + prefix;
