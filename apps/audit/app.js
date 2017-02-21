var __home = __dirname + "/../..";
var __config = __home + '/config/config.json';
var __src = __home + '/src';
var __js = __src + '/js';

var config = require( __config );

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Items = db.Items,
	Departments = db.Departments,
	Groups = db.Groups;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	res.locals.currentModule = 'audit';
	res.render( 'audit' );
} );

// Audited report
app.get( '/scanned', auth.isLoggedIn, function( req, res ) {
	res.locals.currentModule = 'audit';
	var status = req.params.status;
	Groups.find( function( err, groups ) {
		Departments.find( function( err, departments ) {
			var filter = {};
			if ( req.query.department ) filter.department = req.query.department;
			if ( req.query.group ) filter.group = req.query.group;
			Items.find( filter ).populate( 'department' ).populate( 'group' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
				var result = [];
				items.sort( function( a, b ) {
					if ( a.barcode < b.barcode ) return -1;
					if ( a.barcode > b.barcode ) return 1;
					return 0;
				} )
				for ( i in items ) {
					var item = items[i];
					if ( item.audited == true ) {
						result.push( item );
					}
				}

				res.render( '../../reports/views/report', {
					status: 'Scanned',
					items: result,
					departments: departments,
					selectedDepartment: req.query.department,
					groups: groups,
					selectedGroup: req.query.group
				} );
			} );
		} );
	} );
} );

// Missing report
app.get( '/missing', auth.isLoggedIn, function( req, res ) {
	res.locals.currentModule = 'audit';
	var status = req.params.status;
	Groups.find( function( err, groups ) {
		Departments.find( function( err, departments ) {
			var filter = {};
			if ( req.query.department ) filter.department = req.query.department;
			if ( req.query.group ) filter.group = req.query.group;
			Items.find( filter ).populate( 'department' ).populate( 'group' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
				var result = [], other = [];
				items.sort( function( a, b ) {
					if ( a.barcode < b.barcode ) return -1;
					if ( a.barcode > b.barcode ) return 1;
					return 0;
				} )
				for ( i in items ) {
					var item = items[i];
					if ( item.audited != true ) {
						switch ( item.status ) {
							case 'available':
							case 'broken':
							case 'new':
							case 'reserved':
							default:
								result.push( item );
								break;
							case 'on-loan':
							case 'lost':
								other.push( item );
						}
					}
				}

				res.render( 'report', {
					status: 'Missing',
					items: result,
					other: other,
					departments: departments,
					selectedDepartment: req.query.department,
					groups: groups,
					selectedGroup: req.query.group
				} );
			} );
		} );
	} );
} );

module.exports = function( config ) { return app; };
