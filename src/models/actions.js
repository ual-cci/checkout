var db;

var model = {
	name: 'Actions',
	table: 'actions',
	getDateRange: function( a, b, cb ) {
		var query = db( model.table )
			.select( {
				datetime: 'actions.datetime',
				action: 'actions.action'
			} )
			.whereBetween( 'datetime', [ a, b ] )
			.andWhereNot( 'action', 'audited' )
			.orderBy( 'actions.datetime', 'desc' )
				.leftJoin( 'items', 'items.id', 'actions.item_id' )
				.select( {
					item_id: 'items.id',
					item_name: 'items.name',
					item_barcode: 'items.barcode',
				} )
				.leftJoin( 'users AS owner', 'owner.id', 'actions.user_id' )
				.select( {
					owner_id: 'owner.id',
					owner_name: 'owner.name',
					owner_barcode: 'owner.barcode',
				} )
				.leftJoin( 'users AS operator', 'operator.id', 'actions.operator_id' )
				.select( {
					operator_id: 'operator.id',
					operator_name: 'operator.name',
					operator_barcode: 'operator.barcode',
				} )
				.asCallback( function( err, res ) {
					if ( res ) {
						return cb( err, res );
					} else {
						return cb( err );
					}
			} )
	},
	getByItemId: function( id, cb ) {
		model.getByItem( id, 'id', cb );
	},
	getByItemBarcode: function( barcode, cb ) {
		model.getByItem( barcode, 'barcode', cb );
	},
	getByItem: function( term, type, cb ) {
		var query = db( model.table )
			.select( {
				id: 'actions.id',
				item_id: 'actions.item_id',
				action: 'actions.action',
				datetime: 'actions.datetime'
			} );

		switch ( type ) {
			case 'id':
				query.where( 'item_id', term );
				break;

			case 'barcode':
				query.leftJoin( 'items', 'items.id', 'actions.item_id' )
				query.where( 'items.barcode', term );
				break;
		}

		query.orderBy( 'actions.datetime', 'desc' )
			.leftJoin( 'users', 'users.id', 'actions.user_id' )
			.select( {
				user_id: 'users.id',
				user_name: 'users.name',
			} )
			.leftJoin( 'users AS operators', 'operators.id', 'actions.operator_id' )
			.select( {
				operator_id: 'operators.id',
				operator_name: 'operators.name',
			} )
			.asCallback( function( err, res ) {
				if ( res ) {
					return cb( err, res );
				} else {
					return cb( err );
				}
		} )
	},
	getUserHistoryById: function( id, cb ) {
		var query = db( model.table )
			.select( {
				id: 'actions.id',
				action: 'actions.action',
				datetime: 'actions.datetime'
			} )
			.orderBy( 'actions.datetime', 'desc' )
			.leftJoin( 'items', 'items.id', 'actions.item_id' )
			.select( {
				item_id: 'items.id',
				item_name: 'items.name',
				item_barcode: 'items.barcode',
			} )
			.where( 'user_id', id )
			.andWhere( 'action', 'returned' )
			.asCallback( function( err, res ) {
				if ( res ) {
					return cb( err, res );
				} else {
					return cb( err );
				}
		} )
	},
	log: function( data, cb ) {
		var action = {
			item_id: data.item_id,
			action: data.action,
			operator_id: data.operator_id,
			user_id: data.user_id
		}

		if ( data.datetime ) {
			action.datetime = data.datetime;
		} else {
			action.datetime = new Date();
		}

		var q = db( model.table )
			.insert( action )
			.asCallback( function( err ) {
				if ( err ) {
					console.log( err );
					return cb( { message: 'Unable to log action' } );
				}
				cb();
			} )
	},
	removeByUserId: function( id, cb ) {
		db( model.table )
			.where( 'user_id', id )
			.delete()
			.asCallback( function( err, res ) {
			return cb( err );
		} )
	},
	removeByItemId: function( id, cb ) {
		db( model.table )
			.where( 'item_id', id )
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
