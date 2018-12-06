var db;

var model = {
	name: 'Printers',
	table: 'printers',
	get: function( cb ) {
		db( model.table )
			.orderBy( 'name', 'asc' )
			.asCallback( function( err, res ) {
			return cb( err, res );
		} )
	},
	getById: function( id, cb ) {
		db( model.table )
			.where( 'id', id )
			.orderBy( 'name', 'asc' )
			.asCallback( function( err, res ) {
				if ( res ) {
					return cb( err, res[0] );
				} else {
					return cb( err );
				}
		} )
	},
	create: function( values, cb ) {
		db( model.table )
			.insert( values, 'id' )
			.asCallback( function( err, res ) {
			return cb( err, res );
		} )
	},
	update: function( id, values, cb ) {
		db( model.table )
			.update( values )
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
