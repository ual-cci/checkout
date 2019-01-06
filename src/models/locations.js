var db;

var model = {
	name: 'Locations',
	table: 'locations',
	get: function( opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}
		var query = model.basicQuery( opts );
		query.asCallback( function( err, res ) {
			return cb( err, res );
		} )
	},
	getById: function( id, opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}
		model.getBy( id, 'id', opts, cb );
	},
	getByBarcode: function( barcode, opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}
		model.getBy( barcode, 'barcode', opts, cb );
	},
	getBy: function( term, type, opts, cb ) {
		var query = model.basicQuery( opts );

		switch ( type ) {
			case 'id': query.where( 'locations.id', term ); break;
			case 'barcode': query.where( 'locations.barcode', term ); break;
		}

		query.asCallback( function( err, res ) {
			if ( res ) {
				return cb( err, res[0] );
			} else {
				return cb( err );
			}
		} );
	},
	basicQuery: function( opts ) {
		var query = db( model.table )
			.select( {
				id: 'locations.id',
				name: 'locations.name',
				barcode: 'locations.barcode'
			} )
			.orderBy( 'barcode', 'asc' )

		return query;
	},
	create: function( data, cb ) {
		db( model.table )
			.insert( data, 'id' )
			.asCallback( function( err, res ) {
			return cb( err, res );
		} )
	},
	update: function( id, data, cb ) {
		db( model.table )
			.update( data )
			.where( 'id', id )
			.asCallback( function( err, res ) {
			return cb( err );
		} )
	},
	remove: function( id, cb ) {
		db( model.table )
			.where( 'id', id )
			.delete()
			.asCallback( function( err, res ) {
			return cb( err );
		} )
	}
};

module.exports = function( database ) {
	db = database;
	return model;
}
