var db;

var model = {
	name: 'Users',
	table: 'users',
	search: function( term, cb ) {
		var query = db( model.table )
			.select( {
				id: 'users.id',
				name: 'users.name',
				barcode: 'users.barcode',
				disable: 'users.disable'
			} )
			.where( 'name', 'ilike', '%' + term + '%' )
			.orWhere( 'barcode', 'ilike', '%' + term + '%' )
			.orderBy( 'disable', 'asc' )
			.orderBy( 'name', 'asc' )
			.asCallback( function( err, res ) {
				return cb( err, res );
			} );
	},
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
	getMultipleById: function( ids, opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}

		var query = model.basicQuery( opts )
			.whereIn( 'users.id', ids )
			.asCallback( function( err, res ) {
				return cb( err, res );
			} );
	},
	basicQuery: function( opts ) {
		var query = db( model.table )
			.select( {
				id: 'users.id',
				name: 'users.name',
				email: 'users.email',
				barcode: 'users.barcode',
				disable: 'users.disable',
				type: 'users.type',
				pw_hash: 'users.pw_hash',
				pw_salt: 'users.pw_salt',
				pw_iterations: 'users.pw_iterations',
				audit_point: 'users.audit_point',
				printer_id: 'users.printer_id'
			} );

		if ( opts.orderby && opts.direction ) {
			query.orderBy( opts.orderby, opts.direction );
		}

		if ( opts.where && Number.isInteger( parseInt( opts.where.disable ) ) ) {
			query.where( 'users.disable', opts.where.disable );
		}

		if ( opts.where && parseInt( opts.where.course_id ) ) {
			query.where( 'users.course_id', opts.where.course_id );
		}

		if ( opts.where && parseInt( opts.where.year_id )) {
			query.where( 'users.year_id', opts.where.year_id );
		}

		if ( opts.lookup && opts.lookup.indexOf( 'year' ) != -1 ) {
			query.leftJoin( 'years', 'years.id', 'users.year_id' )
			.select( {
				year_id: 'years.id',
				year_name: 'years.name',
			} );
		}

		if ( opts.lookup && opts.lookup.indexOf( 'course' ) != -1 ) {
			query.leftJoin( 'courses', 'courses.id', 'users.course_id' )
			.select( {
				course_id: 'courses.id',
				course_name: 'courses.name',
			} );
		}

		if ( opts.lookup && opts.lookup.indexOf( 'course' ) != -1
			&& opts.lookup.indexOf( 'contact' ) != -1 ) {
			query.leftJoin( 'users AS contact', 'contact.id', 'courses.contact_id' )
			.select( {
				course_contact_id: 'contact.id',
				course_contact_name: 'contact.name',
				course_contact_email: 'contact.email',
			} );
		}

		if ( opts.lookup && opts.lookup.indexOf( 'printer' ) != -1 ) {
			query.leftJoin( 'printers', 'printers.id', 'users.printer_id' )
			.select( {
				printer_id: 'printers.id',
				printer_name: 'printers.name',
				printer_url: 'printers.url'
			} );
		}

		return query;
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
	getByEmail: function( email, opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}
		model.getBy( email, 'email', opts, cb );
	},
	getBy: function( term, type, opts, cb ) {
		var query = model.basicQuery( opts );

		switch ( type ) {
			case 'id': query.where( 'users.id', term ); break;
			case 'barcode': query.where( 'users.barcode', term ); break;
			case 'email': query.where( 'users.email', term ); break;
		}

		query.asCallback( function( err, res ) {
				if ( res ) {
					return cb( err, res[0] );
				} else {
					return cb( err );
				}
		} );
	},
	create: function( values, cb ) {
		db( model.table )
			.insert( values )
			.asCallback( function( err, res ) {
				if ( err ) {
					switch ( err.constraint ) {
						case 'users_barcode_unique':
							return cb( { message: 'Barcode is not unique' } );
							break;
						case 'users_email_unique':
							return cb( { message: 'Email is not unique' } );
							break;
						default:
							console.log( err );
							return cb( { message: 'Unable to create user' } );
							break;
					}
				}
				return cb( err, res );
			} )
	},
	update: function( id, values, cb ) {
		db( model.table )
			.update( values )
			.where( 'id', id )
			.asCallback( function( err ) {
				if ( err ) {
					switch ( err.constraint ) {
						case 'users_barcode_unique':
							return cb( { message: 'Barcode is not unique' } );
							break;
						case 'users_email_unique':
							return cb( { message: 'Email is not unique' } );
							break;
						default:
							console.log( err );
							return cb( { message: 'Unable to update user' } );
							break;
					}
				}
				return cb( err );
			} )
	},
	updateMultiple: function( ids, values, cb ) {
		var q = db( model.table )
			.update( values )
			.whereIn( 'id', ids )
			.asCallback( function( err ) {
				if ( err ) {
					console.log( err );
					return cb( { message: 'Unable to update user' } );
				}
				return cb( err );
			} )
	},
	updateCourse: function( id, new_id, cb ) {
		db( model.table )
			.update( { 'course_id': new_id } )
			.where( 'course_id', id )
			.asCallback( function( err ) {
				if ( err ) {
					console.log( err );
					return cb( { message: 'Unable to update users course' } );
				}
				return cb( err );
			} )
	},
	updateYear: function( id, new_id, cb ) {
		db( model.table )
			.update( { 'year_id': new_id } )
			.where( 'year_id', id )
			.asCallback( function( err ) {
				if ( err ) {
					console.log( err );
					return cb( { message: 'Unable to update users year' } );
				}
				return cb( err );
			} )
	},
	updatePrinter: function( id, new_id, cb ) {
		db( model.table )
			.update( { 'printer_id': new_id } )
			.where( 'printer_id', id )
			.asCallback( function( err ) {
				if ( err ) {
					console.log( err );
					return cb( { message: 'Unable to update users printer' } );
				}
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
