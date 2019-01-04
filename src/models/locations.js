var db;

var model = {
	name: 'Locations',
	table: 'locations',
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
	create: function( name, cb ) {
		db( model.table )
			.insert( {
				name: name
			}, 'id' )
			.asCallback( function( err, res ) {
			return cb( err, res );
		} )
	},
	update: function( id, name, cb ) {
		db( model.table )
			.update( {
				name: name
			} )
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
