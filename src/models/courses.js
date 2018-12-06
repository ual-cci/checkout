var db;

var model = {
	name: 'Courses',
	table: 'courses',
	get: function( cb ) {
		db( model.table )
			.select( {
				id: 'courses.id',
				name: 'courses.name',
				contact_name: 'users.name',
				contact_id: 'users.id'
			} )
			.orderBy( 'courses.name', 'asc' )
			.leftJoin( 'users', 'courses.contact_id', 'users.id' )
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
