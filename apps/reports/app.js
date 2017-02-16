var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Items = db.Items,
	Departments = db.Departments,
	Groups = db.Groups;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

// Status report
app.get( '/status/:status', auth.isLoggedIn, function( req, res ) {
	var status = req.params.status;
	Groups.find( function( err, groups ) {
		Departments.find( function( err, departments ) {
			var filter = {};
			if ( req.query.department ) filter.department = req.query.department;
			if ( req.query.group ) filter.group = req.query.group;
			Items.find( filter ).populate( 'department' ).populate( 'group' ).populate( 'transactions.user' ).sort( 'name' ).sort( 'barcode' ).exec( function( err, items ) {
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

				res.render( 'report', {
					status: status,
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

module.exports = function( config ) { return app; };
