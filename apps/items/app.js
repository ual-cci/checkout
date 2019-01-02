var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

const Items = require('../../src/models/items.js');
const Groups = require('../../src/models/groups.js');
const Departments = require('../../src/models/departments.js');
const Courses = require('../../src/models/courses.js');
const Years = require('../../src/models/years.js');
const Printers = require('../../src/models/printers.js');
const Actions = require('../../src/models/actions.js');

var Print = require( __js + '/print' );

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.post( '/multi' , auth.isLoggedIn, function(req, res) {
  Items.getMultipleById( req.body.ids.split(','), {}, function( err, items ) {
    const barcodes = items.map(item => {
      return {
        barcode: item.barcode,
        text: item.name,
        type: item.label
      };
    });
    Print.labels( barcodes, req.user.printer_url );
    req.flash( 'success', "Printed those labels" );
    res.redirect( app.mountpath );
  } );
});

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Groups.get( function( err, groups ) {
		Departments.get( function( err, departments ) {
			Courses.get( function( err, courses ) {
				Years.get( function( err, years ) {
					var selected = {
						status: req.query.status ? req.query.status : '',
						department: req.query.department ? req.query.department : '',
						group: req.query.group ? req.query.group : '',
						course: req.query.course ? req.query.course : '',
						year: req.query.year ? req.query.year : ''
					};

					if ( Object.keys( req.query ).length == 0 ) {
						res.render( 'items', {
							items: null,
							departments: departments,
							groups: groups,
							courses: courses,
							years: years,
							selected: selected
						} );
					} else {
						var opts = {
							lookup: [ 'group', 'department', 'owner' ],
							where: {}
						};

						// Set sort options
						var sortby_valid_options = [ 'status', 'barcode', 'name', 'owner', 'course', 'year', 'group', 'department', 'value' ];
						var direction_valid_options = [ 'asc', 'desc' ];
						if ( sortby_valid_options.indexOf( req.query.sortby ) != -1 && direction_valid_options.indexOf[ req.query.direction ] != -1 ) {
							var sortby = req.query.sortby;
							if ( req.query.sortby == 'owner' ) sortby = 'owner_name';
							if ( req.query.sortby == 'course' ) sortby = 'owner_course_name';
							if ( req.query.sortby == 'year' ) sortby = 'owner_year_name';
							if ( req.query.sortby == 'group' ) sortby = 'group_name';
							if ( req.query.sortby == 'department' ) sortby = 'department_name';
							opts.orderby = sortby;
							opts.direction = req.query.direction;
						} else {
							opts.orderby = 'barcode';
							opts.direction = 'asc';
						}

						// Set filters
						if ( req.query.status ) opts.where.status = req.query.status;
						if ( req.query.course ) opts.where.course_id = req.query.course;
						if ( req.query.year ) opts.where.years_id = req.query.year;
						if ( req.query.group ) opts.where.group_id = req.query.group;
						if ( req.query.department ) opts.where.department_id = req.query.department;

						// Get items
						Items.get( opts, function( err, items ) {
							res.render( 'items', {
								items: items,
								departments: departments,
								groups: groups,
								courses: courses,
								years: years,
								selected: selected,
								sortby: ( req.query.sortby ? req.query.sortby : 'barcode' ),
								direction: ( req.query.direction ? req.query.direction : 'asc' )
							} );
						} );
					}
				} );
			} );
		} );
	} );
} );

app.post( '/edit', auth.isLoggedIn, function ( req, res ) {
	if ( req.body.fields ) {
		if ( ! Array.isArray( req.body.edit ) ) {
			req.flash( 'warning', 'Only one item was selected for group editing, use the single edit form' );
			res.redirect( '/items/' + req.body.edit + '/edit' );
			return;
		}

		var item = {}
		if ( req.body.fields.indexOf( 'label' ) != -1 && req.body.label != '' )
			item.label = req.body.label;

		if ( req.body.fields.indexOf( 'group' ) != -1 && req.body.group != '' )
			item.group_id = req.body.group;

		if ( req.body.fields.indexOf( 'department' ) != -1 && req.body.department != '' )
			item.department_id = req.body.department;

		if ( req.body.fields.indexOf( 'notes' ) != -1 && req.body.notes != '' )
			item.notes = req.body.notes;

		if ( req.body.fields.indexOf( 'value' ) != -1 && req.body.value != '' )
			item.value = req.body.value;

		Items.updateMultiple( req.body.edit, item, function ( err, result ) {
			if ( ! err ) {
				req.flash( 'success', 'Items updated' );
				res.redirect( app.mountpath );
			} else {
				req.flash( 'danger', err.message );
				res.redirect( app.mountpath + '/' + req.params.id );
			}
		} );
	} else {
		Groups.get( function( err, groups ) {
			Departments.get( function( err, departments ) {
				if ( ! Array.isArray( req.body.edit ) ) {
					req.flash( 'warning', 'Only one item was selected for group editing, use the single edit form' );
					res.redirect( '/items/' + req.body.edit + '/edit' );
					return;
				}

				var opts = {
					lookup: [ 'group', 'department', 'owner' ],
					where: {},
					orderby: 'barcode',
					direction: 'asc'
				};

				// Get items
				Items.getMultipleById( req.body.edit, opts, function( err, items ) {
					res.render( 'edit-multiple', {
						items: items,
						groups: groups,
						departments: departments
					} );
				} );
			} );
		} );
	}
} );

// Generate items
app.get( '/generate', auth.isLoggedIn, function ( req, res ) {
	Departments.get( function( err, departments ) {
		Groups.get( function( err, groups ) {
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
	var end = ( start + parseInt( req.body.qty ) ) - 1;

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
	} else if ( end > 25 && ! req.body.largeBatch ) {
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
			name: req.body.name.trim(),
			barcode: req.body.prefix,
			label: req.body.label,
			value: req.body.value,
			department_id: req.body.department,
			notes: req.body.notes,
			status: 'available'
		}

		if ( req.body.group )
			item.group_id = req.body.group;

		var index = i.toString();
		if ( i < 10 ) index = '0' + index;
		if ( req.body.suffix ) item.name += " #" + index;
		item.barcode += index.toString();
		barcodes.push( {
			barcode: item.barcode,
			text: item.name,
			type: item.label
		} );
		items.push( item );
	}

	Items.create( items, function ( err, result ) {
		if ( ! err ) {
			req.flash( 'success', 'Items created' );
			if ( req.body.print ) {
				if ( req.user.printer_id ) {
					Print.labels( barcodes, req.user.printer_url );
					req.flash( 'info', 'Labels printed to ' + req.user.printer_name );
				} else {
					req.flash( 'warning', 'No printer configured' );
				}
			}
			res.redirect( app.mountpath );
		} else {
			req.flash( 'danger', err.message );
			res.redirect( app.mountpath + '/generate' );
		}
	} );
} )

// Create item
app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	Departments.get( function( err, departments ) {
		Groups.get( function( err, groups ) {
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
		name: req.body.name,
		barcode: req.body.barcode,
		label: req.body.label,
		value: req.body.value,
		department_id: req.body.department,
		notes: req.body.notes,
		status: 'available'
	}

	if ( req.body.group )
		item.group_id = req.body.group;

	if ( item.name == '' ) {
		req.flash( 'danger', 'The item requires a name' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( item.barcode == '' ) {
		req.flash( 'danger', 'The item requires a unique barcode' );
		res.redirect( app.mountpath + '/create' );
		return;
	} else if ( ! item.department_id ) {
		req.flash( 'danger', 'The item must be assigned to a department' );
		res.redirect( app.mountpath + '/create' );
		return;
	}

	Items.create( item, function ( err, result ) {
		if ( ! err ) {
			req.flash( 'success', 'Item created' );
			if ( req.body.print ) {
				if ( req.user.printer_id ) {
					Print.label( {
						barcode: item.barcode,
						text: item.name,
						type: item.label
					}, req.user.printer_url );
					req.flash( 'info', 'Label printed to ' + req.user.printer_name );
				} else {
					req.flash( 'warning', 'No printer configured' );
				}
			}
			res.redirect( app.mountpath );
		} else {
			req.flash( 'danger', err.message );
			res.redirect( app.mountpath + '/create' );
		}
	} );
} )

// List an item
app.get( '/:id', auth.isLoggedIn, function( req, res ) {
	Printers.get( function( err, printers ) {
		Items.getById( req.params.id, function( err, item ) {
			if ( item ) {
				Actions.getByItemId( item.id, function( err, history ) {
					res.render( 'item', {
						item: item,
						printers: printers,
						history: history
					} );
				} );
			} else {
				req.flash( 'danger', 'Item not found' );
				res.redirect( app.mountpath );
			}
		} );
	} );
} )

// Reprint an item
app.get( '/:id/label', auth.isLoggedIn, function( req, res ) {
	Items.getById( req.params.id,  function( err, item ) {
		if ( item ) {
			var printer_id;
			if ( req.query.printer ) {
				printer_id = req.query.printer;
			} else if ( req.user.printer_id ) {
				printer_id = req.user.printer_id;
			} else {
				req.flash( 'danger', 'No printer selected' );
				res.redirect( app.mountpath );
				return;
			}

			Printers.getById( printer_id, function( err, printer ) {
				if ( printer ) {
					Print.label( {
						barcode: item.barcode,
						text: item.name,
						type: item.label
					}, printer.url );

					req.flash( 'info', 'Label printed to ' + printer.name );
					if ( req.get( 'referer' ) && req.get( 'referer' ).indexOf( 'items/' + req.params.id ) == -1 ) {
						res.redirect( app.mountpath );
					} else {
						res.redirect( app.mountpath + '/' + item.id.toString() );
					}
				} else {
					req.flash( 'warning', 'Invalid printer' );
					res.redirect( app.mountpath );
				}
			} )
		} else {
			req.flash( 'danger', 'Item not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

// Edit item form
app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Items.getById( req.params.id, { lookup: ['group', 'department']}, function( err, item ) {
		if ( item ) {
			Groups.get( function( err, groups ) {
				Departments.get( function( err, departments ) {
					res.render( 'edit', {
						item: item,
						groups: groups,
						departments: departments
					} );
				} );
			} );
		} else {
			req.flash( 'danger', 'Item not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

// Edit item handler
app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	var item = {
		name: req.body.name,
		barcode: req.body.barcode,
		label: req.body.label,
		department_id: req.body.department,
		value: req.body.value,
		notes: req.body.notes
	};

	if ( req.body.group != '' ) {
		item.group_id = req.body.group;
	}

	Items.update( req.params.id, item, function ( err, result ) {
		if ( ! err ) {
			req.flash( 'success', 'Item updated' );
			if ( req.body.print ) {
				if ( req.user.printer_id ) {
					Print.label( {
						barcode: item.barcode,
						text: item.name,
						type: item.label
					}, req.user.printer_url );
					req.flash( 'info', 'Label reprinted to ' + req.user.printer_name );
				} else {
					req.flash( 'warning', 'No printer configured' );
				}
			}
			res.redirect( app.mountpath + '/' + req.params.id );
		} else {
			req.flash( 'danger', err.message );
			res.redirect( app.mountpath + '/' + req.params.id );
		}
	} );
} )

app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Items.getById( req.params.id, function( err, item ) {
		if ( item ) {
			res.render( 'confirm-remove', {
				selected: item
			} );
		} else {
			req.flash( 'danger', 'Item not found' );
			res.redirect( app.mountpath );
		}
	} );
} )

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
	Items.getById( req.params.id, function( err, item ) {
		if ( ! item ) {
			req.flash( 'danger', 'Item not found' );
			res.redirect( app.mountpath );
			return;
		}

		Actions.removeByItemId( item.id, function( err ) {
			if ( err ) {
				req.flash( 'danger', 'Could not remove item history' );
				res.redirect( app.mountpath );
				return;
			} else {
				Items.remove( item.id, function( err ) {
					if ( err ) {
						req.flash( 'danger', 'Could not remove item' );
						res.redirect( app.mountpath );
						return;
					}

					req.flash( 'success', "Item and it's history removed" );
					res.redirect( app.mountpath );
				} );
			}
		} )
	} );
} )

module.exports = function( config ) { return app; };
