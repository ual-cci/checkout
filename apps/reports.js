var prefix = 'reports';

var	express = require( 'express' ),
	app = express(),
	Items = require( __dirname + '/../models/items' ),
	Departments = require( __dirname + '/../models/departments' ),
	ObjectId = require( 'mongoose' ).Schema.Types.ObjectId;

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'reports';
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

// Audited report
app.get( '/audited', function( req, res ) {
	var status = req.params.status;
	Departments.find( function( err, departments ) {
		var filter = {};
		if ( req.query.department ) filter.department = req.query.department;
		Items.find( filter ).populate( 'department' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
			var result = [];

			for ( i in items ) {
				var item = items[i];
				if ( item.audited == true ) {
					result.push( item );
				}
			}

			res.render( prefix + '/report', {
				status: 'Audited',
				items: result,
				departments: departments,
				selectedDepartment: req.query.department
			} );
		} );
	} );
} );

// Missing report
app.get( '/missing', function( req, res ) {
	var status = req.params.status;
	Departments.find( function( err, departments ) {
		var filter = {};
		if ( req.query.department ) filter.department = req.query.department;
		Items.find( filter ).populate( 'department' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
			var result = [], other = [];

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
							other.push( item );
					}
				}
			}

			res.render( prefix + '/audit', {
				status: 'Missing',
				items: result,
				other: other,
				departments: departments,
				selectedDepartment: req.query.department
			} );
		} );
	} );
} );

// Status report
app.get( '/status/:status', function( req, res ) {
	var status = req.params.status;
	Departments.find( function( err, departments ) {
		var filter = {};
		if ( req.query.department ) filter.department = req.query.department;
		Items.find( filter ).populate( 'department' ).populate( 'transactions.user' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
			var result = [];

			for ( i in items ) {
				var item = items[i];

				if ( item.status == status ) {
					result.push( item );

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
			}

			res.render( prefix + '/report', {
				status: status,
				items: result,
				departments: departments,
				selectedDepartment: req.query.department
			} );
		} );
	} );
} );

// Status report
app.get( '/course', function( req, res ) {
	Courses.find( function( err, courses ) {
		res.render( prefix + '/courses', {
			courses: courses
		} );
	} );
} );

// Status report
app.get( '/course/:course', function( req, res ) {
	Courses.findById( req.params.course, function( err, course ) {
		Items.find().populate( 'department' ).populate( 'transactions.user' ).exec( function( err, items ) {
			var result = [];

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

					if ( last_transaction.user.course == req.params.course ) {
						result.push( item );
						item.owner = last_transaction.user;
					}
				}
			}

			res.render( prefix + '/course', {
				course: course.name,
				items: result
			} );
		} );
	} );
} );

module.exports = app;
module.exports.path = '/' + prefix;