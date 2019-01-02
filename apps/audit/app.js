var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var moment = require( 'moment' );

const Items = require('../../src/models/items.js');
const Departments = require('../../src/models/departments.js');
const Groups = require('../../src/models/groups.js');
const Courses = require('../../src/models/courses.js');
const Years = require('../../src/models/years.js');

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

// Audited report
app.get( '/scanned', auth.isLoggedIn, function( req, res ) {
	var status = req.params.status;
	Groups.get( function( err, groups ) {
		Departments.get( function( err, departments ) {
			var date = moment().startOf( 'day' );
			if ( req.user.audit_point ) date = moment( req.user.audit_point );
			var opts = {
				lookup: [ 'group', 'department', 'owner' ],
				where: {
					audited: date
				}
			};

			var selected = {
				status: req.query.status ? req.query.status : '',
				department: req.query.department ? req.query.department : '',
				group: req.query.group ? req.query.group : ''
			};

			// Set sort options
			var sortby_valid_options = [ 'status', 'barcode', 'name', 'owner', 'group', 'department', 'value' ];
			var direction_valid_options = [ 'asc', 'desc' ];
			if ( sortby_valid_options.indexOf( req.query.sortby ) != -1 && direction_valid_options.indexOf[ req.query.direction ] != -1 ) {
				var sortby = req.query.sortby;
				if ( req.query.sortby == 'owner' ) sortby = 'owner_name';
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
			if ( req.query.group ) opts.where.group_id = req.query.group;
			if ( req.query.department ) opts.where.department_id = req.query.department;

			// Get items
			Items.get( opts, function( err, items ) {
				res.render( 'report', {
					status: 'Scanned',
					items: items,
					departments: departments,
					groups: groups,
					selected: selected,
					sortby: ( req.query.sortby ? req.query.sortby : 'barcode' ),
					direction: ( req.query.direction ? req.query.direction : 'asc' ),
					filter_path: '/audit/scanned/'
				} );
			} );
		} );
	} );
} );

// Missing report
app.get( '/missing', auth.isLoggedIn, function( req, res ) {
	var status = req.params.status;
	Groups.get( function( err, groups ) {
		Departments.get( function( err, departments ) {
			var date = moment().startOf( 'day' );
			if ( req.user.audit_point ) date = moment( req.user.audit_point );
			var opts = {
				lookup: [ 'group', 'department', 'owner' ],
				where: {
					missing: date
				}
			};

			var selected = {
				status: req.query.status ? req.query.status : '',
				department: req.query.department ? req.query.department : '',
				group: req.query.group ? req.query.group : ''
			};

			// Set sort options
			var sortby_valid_options = [ 'status', 'barcode', 'name', 'owner', 'group', 'department', 'value' ];
			var direction_valid_options = [ 'asc', 'desc' ];
			if ( sortby_valid_options.indexOf( req.query.sortby ) != -1 && direction_valid_options.indexOf[ req.query.direction ] != -1 ) {
				var sortby = req.query.sortby;
				if ( req.query.sortby == 'owner' ) sortby = 'owner_name';
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
			if ( req.query.group ) opts.where.group_id = req.query.group;
			if ( req.query.department ) opts.where.department_id = req.query.department;

			// Get items
			Items.get( opts, function( err, items ) {
				res.render( 'report', {
					status: 'Missing',
					items: items,
					departments: departments,
					groups: groups,
					selected: selected,
					sortby: ( req.query.sortby ? req.query.sortby : 'barcode' ),
					direction: ( req.query.direction ? req.query.direction : 'asc' ),
					filter_path: '/audit/missing/'
				} );
			} );
		} );
	} );
} );

module.exports = function( config ) { return app; };
