const db = require('../js/database.js');

var model = {
	name: 'Items',
	table: 'items',
	basicQuery: function( opts ) {
		var query = db( model.table )
			.select( {
				id: 'items.id',
				name: 'items.name',
				barcode: 'items.barcode',
				notes: 'items.notes',
				value: 'items.value',
				label: 'items.label',
				status: 'items.status',
				audited: 'items.audited',
				updated: 'items.updated',
			} )

		if ( opts.where && opts.where.audited ) {
			query.where( 'items.audited', '>=', opts.where.audited );
		}

		if ( opts.orderby && opts.direction ) {
			query.orderBy( opts.orderby, opts.direction );
		}

		if ( opts.where && opts.where.status ) {
			query.where( 'items.status', opts.where.status );
		}

		if ( opts.where && parseInt( opts.where.course_id ) ) {
			query.where( 'courses.id', opts.where.course_id );
		}

		if ( opts.where && parseInt( opts.where.years_id ) ) {
			query.where( 'years.id', opts.where.years_id );
		}

		if ( opts.where && parseInt( opts.where.group_id ) ) {
			query.where( 'items.group_id', opts.where.group_id );
		}

		if ( opts.where && parseInt( opts.where.department_id ) ) {
			query.where( 'items.department_id', opts.where.department_id );
		}

		// Must come after all the others
		if ( opts.where && opts.where.missing ) {
			query.andWhere( 'items.audited', null )
				.orWhere( 'items.audited', '<', opts.where.missing );
		}

		if ( opts.lookup && opts.lookup.indexOf( 'group' ) != -1 ) {
			query.leftJoin( 'groups', 'groups.id', 'items.group_id' )
			.select( {
				group_id: 'groups.id',
				group_name: 'groups.name',
				group_limiter: 'groups.limiter',
			} );
		}

		if ( opts.lookup && opts.lookup.indexOf( 'department' ) != -1 ) {
			query.leftJoin( 'departments', 'departments.id', 'items.department_id' )
			.select( {
				department_id: 'departments.id',
				department_name: 'departments.name',
			} );
		}

		if ( opts.lookup && opts.lookup.indexOf( 'owner' ) != -1 ) {
			query.leftJoin( 'users', 'users.id', 'items.owner_id' )
			.select( {
				owner_id: 'users.id',
				owner_name: 'users.name',
			} );
			query.leftJoin( 'courses', 'users.course_id', 'courses.id' )
			.select( {
				owner_course_id: 'courses.id',
				owner_course_name: 'courses.name',
			} );
			query.leftJoin( 'years', 'users.year_id', 'years.id' )
			.select( {
				owner_year_id: 'years.id',
				owner_year_name: 'years.name',
			} );
		}

		return query;
	},
	search: function( term, cb ) {
		var query = db( model.table )
			.select( {
				id: 'items.id',
				name: 'items.name',
				barcode: 'items.barcode',
				status: 'items.status'
			} )
			.where( 'name', 'ilike', '%' + term + '%' )
			.orWhere( 'barcode', 'ilike', '%' + term + '%' )
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
		});
	},
	getMultipleById: function( ids, opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}

		var query = model.basicQuery( opts )
			.whereIn( 'items.id', ids )
			.asCallback( function( err, res ) {
				return cb( err, res );
			} );
	},
	getOnLoanToUserId: function( user_id, opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}

		var query = model.basicQuery( opts )
			.where( 'status', 'on-loan' )
			.where( 'owner_id', user_id )
			.asCallback( function( err, res ) {
				return cb( err, res );
			} );
	},
	countItemsByGroupOnLoanToUserById: function( user_id, group_id, opts, cb ) {
		if ( typeof opts == 'function' ) {
			cb = opts;
			opts = {};
		}

		var query = model.basicQuery( opts )
			.where( 'status', 'on-loan' )
			.where( 'owner_id', user_id )
			.where( 'group_id', user_id )
			.asCallback( function( err, res ) {
				return cb( err, res.length );
			} );
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
			case 'id': query.where( 'items.id', term ); break;
			case 'barcode': query.where( 'items.barcode', term ); break;
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
						case 'items_barcode_unique':
							return cb( { message: 'Barcode is not unique' } );
							break;
						case 'items_name_unique':
							return cb( { message: 'Name is not unique' } );
							break;
						default:
							console.log( err );
							return cb( { message: 'Unable to create item' } );
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
						case 'items_barcode_unique':
							return cb( { message: 'Barcode(s) is/are not unique' } );
							break;
						case 'items_name_unique':
							return cb( { message: 'Name is not unique' } );
							break;
						default:
							console.log( err );
							return cb( { message: 'Unable to update item' } );
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
					return cb( { message: 'Unable to update item' } );
				}
				return cb( err );
			} )
	},
	return: function( barcode, cb ) {
		db( model.table )
			.select( '*' )
			.where( 'barcode', barcode )
			.asCallback( function( err, items ) {
				if ( items[0] ) {
					var item = items[0];
					if ( item.status == 'available' ) {
						cb( { message: 'Item already returned', status: 'warning' } );
					} else {
						db( model.table )
							.update( {
								status: 'available',
								owner_id: null,
								updated: new Date()
							} )
							.where( 'id', item.id )
							.asCallback( function( err ) {
								if ( err ) {
									console.log( err );
									return cb( { message: 'Unable to update item', status: 'danger' } );
								} else {
									cb( { message: 'Item returned', status: 'success' }, item );
								}
							} )
					}
				} else {
					cb( { message: 'Unknown item', status: 'danger' }, null );
				}
			} )
	},
	broken: function( barcode, cb ) {
		db( model.table )
			.select( '*' )
			.where( 'barcode', barcode )
			.asCallback( function( err, items ) {
				if ( items[0] ) {
					var item = items[0];
					if ( item.status == 'broken' ) {
						cb( { message: 'Item already marked as broken', status: 'warning' } );
					} else if ( item.status == 'lost' ) {
						cb( { message: 'Item marked as lost', status: 'warning' } );
					} else {
						db( model.table )
							.update( {
								status: 'broken',
								owner_id: null,
								updated: new Date()
							} )
							.where( 'id', item.id )
							.asCallback( function( err ) {
								if ( err ) {
									console.log( err );
									return cb( { message: 'Unable to update item', status: 'danger' } );
								} else {
									cb( { message: 'Item marked as broken', status: 'success' }, item );
								}
							} )
					}
				} else {
					cb( { message: 'Unknown item', status: 'danger' }, null );
				}
			} )
	},
	lost: function( barcode, cb ) {
		db( model.table )
			.select( '*' )
			.where( 'barcode', barcode )
			.asCallback( function( err, items ) {
				if ( items[0] ) {
					var item = items[0];
					if ( item.status == 'lost' ) {
						cb( { message: 'Item already marked as lost', status: 'warning' } );
					} else if ( item.status == 'broken' ) {
						cb( { message: 'Item marked as broken', status: 'warning' } );
					} else {
						db( model.table )
							.update( {
								status: 'lost',
								owner_id: null,
								updated: new Date()
							} )
							.where( 'id', item.id )
							.asCallback( function( err ) {
								if ( err ) {
									console.log( err );
									return cb( { message: 'Unable to update item', status: 'danger' } );
								} else {
									cb( { message: 'Item marked as lost', status: 'success' }, item );
								}
							} )
					}
				} else {
					cb( { message: 'Unknown item', status: 'danger' }, null );
				}
			} )
	},
	issue: function( item_barcode, user_id, cb ) {
		db( model.table )
			.select( '*' )
			.where( 'barcode', item_barcode )
			.asCallback( function( err, items ) {
				if ( items[0] ) {
					var item = items[0];
					if ( item.status == 'lost' ) {
						cb( { message: 'Item marked as lost', status: 'warning' } );
					} else if ( item.status == 'broken' ) {
						cb( { message: 'Item marked as broken', status: 'warning' } );
					} else if ( item.status == 'on-loan' ) {
						cb( { message: 'Item already on loan to another suer', status: 'warning' } );
					} else {
						db( model.table )
							.update( {
								status: 'on-loan',
								owner_id: user_id,
								updated: new Date()
							} )
							.where( 'id', item.id )
							.asCallback( function( err ) {
								if ( err ) {
									console.log( err );
									return cb( { message: 'Unable to update item', status: 'danger' } );
								} else {
									cb( { message: 'Item issued', status: 'success' }, item );
								}
							} )
					}
				} else {
					cb( { message: 'Unknown item', status: 'danger' }, null );
				}
			} )
	},
	audit: function( barcode , cb ) {
		db( model.table )
			.select( '*' )
			.where( 'barcode', barcode )
			.asCallback( function( err, items ) {
				if ( items[0] ) {
					var item = items[0];
					db( model.table )
						.update( {
							audited: new Date()
						} )
						.where( 'id', item.id )
						.asCallback( function( err ) {
							if ( err ) {
								console.log( err );
								return cb( { message: 'Unable to audit item', status: 'danger' } );
							} else {
								cb( { message: 'Item audited', status: 'success' }, item );
							}
						} )
				} else {
					cb( { message: 'Unknown item', status: 'danger' }, null );
				}
			} )
	},
	updateDepartment: function( id, new_id, cb ) {
		db( model.table )
			.update( { 'department_id': new_id } )
			.where( 'department_id', id )
			.asCallback( function( err ) {
				if ( err ) {
					console.log( err );
					return cb( { message: 'Unable to update items department' } );
				}
				return cb( err );
			} )
	},
	updateGroup: function( id, new_id, cb ) {
		db( model.table )
			.update( { 'group_id': new_id } )
			.where( 'group_id', id )
			.asCallback( function( err ) {
				if ( err ) {
					console.log( err );
					return cb( { message: 'Unable to update items group' } );
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

module.exports = model;
