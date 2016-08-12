var sio = require( 'socket.io' );
var swig = require( 'swig' );
var Items = require( __dirname + '/../models/items' ),
	Users = require( __dirname + '/../models/users' ),
	ObjectId = require( 'mongoose' ).Schema.Types.ObjectId;

module.exports = function( server ) {
	var io = sio.listen( server );

	io.on( 'connection', function( socket ) {
		socket.on( 'audit', function ( action ) {
			if ( this.request.session.user ) {
				var itemFilter = {};
				var val = /([A-Z]{2,4})  ?([0-9]{2})/.exec( action.itemBarcode.toUpperCase() );
				if ( val ) {
					if ( action.itemBarcode ) itemFilter.barcode = val[1] + ' ' + val[2];;
					if ( action.itemId ) itemFilter._id = action.itemId;
					var loggedInUser = this.request.session.user;
					Items.findOne( itemFilter, function( err, item ) {
						if ( ! item && itemFilter.barcode ) {
							socket.emit( 'flash', { type: 'danger', message: 'Unknown item', barcode: itemFilter.barcode } );
							return;
						} else if ( ! item && itemFilter._id ) {
							socket.emit( 'flash', { type: 'danger', message: 'Unknown item', barcode: itemFilter._id } );
							return;
						} else if ( ! item ) {
							socket.emit( 'flash', { type: 'danger', message: 'Unknown item', barcode: 'Error' } );
							return;
						} else if ( item.status == 'lost' ) {
							socket.emit( 'flash', { type: 'danger', message: 'Item currently marked as lost', barcode: 'Error' } );
							return;
						} else if ( item.status == 'on-loan' ) {
							socket.emit( 'flash', { type: 'danger', message: 'Item currently marked as on loan', barcode: 'Error' } );
							return;
						}

						Items.update( { _id: item._id }, {
							$push: {
								transactions: {
									date: new Date(),
									user: loggedInUser.id,
									status: 'audited'
								}
							}
						} ).then ( function ( status ) {
							if ( status.n == 1 ) {
								socket.emit( 'flash', { type: 'success', message: 'Audited', barcode: item.barcode } );
							} else {
								socket.emit( 'flash', { type: 'danger', message: 'Not found', barcode: item.barcode } );
							}
						}, function ( err ) {
							socket.emit( 'flash', { type: 'danger', message: 'Unknown item', barcode: item.barcode } );
						} );
					} )
				} else {
					socket.emit( 'flash', { type: 'danger', message: 'Format invalid', barcode: action.itemBarcode } );
				};
			}
		} )
		socket.on( 'user', function( barcode ) {
			if ( this.request.session.user ) {
				if ( barcode.substring( 0, 4 ) == '1234' && barcode.length == 12 ) {
					sendUserModule( socket, barcode );
				}
			}
		} );
		socket.on( 'item', function( barcode ) {
			if ( this.request.session.user ) {
				if ( /([A-Z]{2,4}) ([0-9]{2})/.exec( barcode ) != null ) {
					sendItemModule( socket, barcode );
				}
			}
		} );
		socket.on( 'update-stats', function() {
			updateStats();
		} );
		socket.on( 'broken', function( action ) {
			if ( this.request.session.user ) {
				Users.findOne( { barcode: action.user }, function( err, user ) {
					if ( user == undefined ) return;

					Items.findOne( { barcode: action.item }, function( err, item ) {
						if ( item == undefined ) return;

						if ( item.status == 'broken' ) {
							socket.emit( 'flash', { type: 'warning', message: 'Item already marked as broken', barcode: item.barcode } );
							sendItemModule( socket, action.item );
							return;
						} else if ( item.status == 'new' ) {
							socket.emit( 'flash', { type: 'warning', message: 'Item has not yet been activated, audit the item before marking it as broken', barcode: item.barcode } );
							sendItemModule( socket, action.item );
							return;
						}
						Items.update( { _id: item._id }, {
							$push: {
								transactions: {
									date: new Date(),
									user: user._id,
									status: 'broken'
								}
							}
						} ).then( function ( status ) {
							if ( status.n == 1 ) {
								sendItemModule( socket, action.item );
							} else {
								socket.emit( 'flash', { type: 'danger', message: 'There was an error updating the item', barcode: item.barcode } );
								sendItemModule( socket, action.item );

							}
						}, function ( status ) {
							socket.emit( 'flash', { type: 'danger', message: 'There was an error updating the item', barcode: item.barcode } );
							sendItemModule( socket, action.item );

						} );
					} );
				})
			}
		} );
		socket.on( 'lost', function( action ) {
			if ( this.request.session.user ) {
				Users.findOne( { barcode: action.user }, function( err, user ) {
					if ( user == undefined ) return;

					Items.findOne( { barcode: action.item }, function( err, item ) {
						if ( item == undefined ) return;

						if ( item.status == 'lost' ) {
							socket.emit( 'flash', { type: 'warning', message: 'Item already marked as lost', barcode: item.barcode } );
							sendItemModule( socket, action.item );
							return;
						} else if ( item.status == 'new' ) {
							socket.emit( 'flash', { type: 'warning', message: 'Item has not yet been activated, audit the item before marking it as lost', barcode: item.barcode } );
							sendItemModule( socket, action.item );
							return;
						}
						Items.update( { _id: item._id }, {
							$push: {
								transactions: {
									date: new Date(),
									user: user._id,
									status: 'lost'
								}
							}
						} ).then( function ( status ) {
							if ( status.n == 1 ) {
								sendItemModule( socket, action.item );
							} else {
								socket.emit( 'flash', { type: 'danger', message: 'There was an error updating the item', barcode: item.barcode } );
								sendItemModule( socket, action.item );
							}
						}, function ( status ) {
							socket.emit( 'flash', { type: 'danger', message: 'There was an error updating the item', barcode: item.barcode } );
							sendItemModule( socket, action.item );
						} );
					} );
				})
			}
		} );
		socket.on( 'return', function( action ) {
			if ( this.request.session.user ) {
				var itemFilter = {};
				var loggedInUser = this.request.session.user;
				Items.findOne( { barcode: action.item }, function( err, item ) {
					if ( item.status == 'available' ) {
						socket.emit( 'flash', { type: 'warning', message: 'Item already returned', barcode: item.barcode } );
						sendItemModule( socket, action.item );
						return;
					} else if ( item.status == 'new' ) {
						socket.emit( 'flash', { type: 'danger', message: 'Item has not yet been activated, audit the item before returning it', barcode: item.barcode } );
						sendItemModule( socket, action.item );
						return;
					}
					Items.update( { _id: item._id }, {
						$push: {
							transactions: {
								date: new Date(),
								user: loggedInUser.id,
								status: 'returned'
							}
						}
					}, function ( err ) {
						sendItemModule( socket, action.item );
					} );
				} );
			}
		} );
		socket.on( 'reserve', function( action ) {
			if ( this.request.session.user ) {
				var loggedInUser = this.request.session.user;
				Items.findOne( { barcode: action.item }, function( err, item ) {
					if ( item == undefined ) {
						socket.emit( 'flash', { type: 'danger', message: 'Item not found', barcode: action.item } );
						sendItemModule( socket, action.item );
						return;
					}

					if ( item.status == 'reserved' ) {
						socket.emit( 'flash', { type: 'warning', message: 'Item already reserved', barcode: item.barcode } );
						sendItemModule( socket, action.item );
						return;
					} else if ( item.status == 'new' ) {
						socket.emit( 'flash', { type: 'warning', message: 'Item has not yet been activated, audit item before reserving it', barcode: item.barcode } );
						sendItemModule( socket, action.item );
						return;
					} else if ( item.status == 'broken' ) {
						socket.emit( 'flash', { type: 'warning', message: 'Item is broken, return it before reserving it', barcode: item.barcode } );
						sendItemModule( socket, action.item );
						return;
					}

					Users.findOne( { barcode: action.user }, function( err, user ) {
						if ( user != null ) {
							Items.update( { barcode: action.item }, {
								$push: {
									transactions: {
										date: new Date(),
										user: user._id,
										status: 'reserved'
									}
								}
							} ).then( function ( status ) {
								if ( status.n == 1 ) {
									sendItemModule( socket, action.item );
								} else {
									socket.emit( 'flash', { type: 'danger', message: 'There was an error reserving the item', barcode: item.barcode } );
									sendItemModule( socket, action.item );
								}
							}, function ( status ) {
								socket.emit( 'flash', { type: 'danger', message: 'There was an error reserving the item', barcode: item.barcode } );
								sendItemModule( socket, action.item );
							} );
						} else {
							socket.emit( 'flash', { type: 'danger', message: 'Invalid user', barcode: item.barcode } );
							sendItemModule( socket, action.item );
						}
					} );
				} );
			}
		} );
		socket.on( 'issue', function( action ) {
			if ( this.request.session.user ) {
				var loggedInUser = this.request.session.user;
				Items.findOne( { barcode: action.item } ).populate( 'group' ).exec( function( err, item ) {
					if ( item != undefined ) {
						switch ( item.status ) {
							case 'on-loan':
								socket.emit( 'flash', { type: 'danger', message: 'Item on loan to another user', barcode: item.barcode } );
								if ( action.mode == 'item' ) {
									sendItemModule( socket, action.item );
								} else if ( action.mode == 'user' ) {
									sendUserModule( socket, action.user );
								}
								break;
							case 'lost':
								socket.emit( 'flash', { type: 'danger', message: 'Item is currently lost', barcode: item.barcode } );
								if ( action.mode == 'item' ) {
									sendItemModule( socket, action.item );
								} else if ( action.mode == 'user' ) {
									sendUserModule( socket, action.user );
								}
								break;
							case 'broken':
								socket.emit( 'flash', { type: 'danger', message: 'Item is currently broken', barcode: item.barcode } );
								if ( action.mode == 'item' ) {
									sendItemModule( socket, action.item );
								} else if ( action.mode == 'user' ) {
									sendUserModule( socket, action.user );
								}
								break;
							case 'new':
								socket.emit( 'flash', { type: 'danger', message: 'Item has not yet been activated, audit the item before issuing it', barcode: item.barcode } );
								if ( action.mode == 'item' ) {
									sendItemModule( socket, action.item );
								} else if ( action.mode == 'user' ) {
									sendUserModule( socket, action.user );
								}
								break;
							case 'reserved':
							case 'available':
								Users.findOne( { barcode: action.user }, function( err, user ) {
									if ( user != null ) {
										if ( item.status == 'reserved' ) {
											if ( user.id != item.transactions[ item.transactions.length - 1 ].user ) {
												socket.emit( 'flash', { type: 'danger', message: 'Item is currently reserved by another user', barcode: item.barcode } );
												if ( action.mode == 'item' ) {
													sendItemModule( socket, action.item );
												} else if ( action.mode == 'user' ) {
													sendUserModule( socket, action.user );
												}
												return;
											}
										}
										if ( item.group != null && item.group.limiter != null ) {
											Items.find( { group: item.group._id }, function( err, groupItems ) {
												var count = 0;
												for ( i in groupItems ) {
													var groupItem = groupItems[i];
													if ( groupItem.status == 'on-loan' ) {
														var owner_transaction = 0;
														for ( i = groupItem.transactions.length - 1; i >= 0; i-- ) {
															if ( groupItem.transactions[ i ].status == 'loaned' ) {
																last_transaction = groupItem.transactions[ i ];
																break;
															}
														}
														if ( last_transaction.user.toString() == user._id.toString() ) count++;
													}
												}
												if ( count >= item.group.limiter && action.override != true ) {
													socket.emit( 'flash', {
														type: 'danger',
														message: 'You already have ' + count + ' of this type of item out.',
														barcode: item.barcode,
														btn: {
															text: 'Override',
															class: 'override'
														}
													} );
													if ( action.mode == 'item' ) {
														sendItemModule( socket, action.item, action.user );
													} else if ( action.mode == 'user' ) {
														sendUserModule( socket, action.user, action.item );
													}
												} else {
													Items.update( { _id: item._id }, {
														$push: {
															transactions: {
																date: new Date(),
																user: user._id,
																status: 'loaned'
															}
														}
													}, function ( err ) {
														if ( action.mode == 'item' ) {
															sendItemModule( socket, action.item );
														} else if ( action.mode == 'user' ) {
															sendUserModule( socket, action.user );
														}
													} );
												}
											} );
										} else {
											Items.update( { _id: item._id }, {
												$push: {
													transactions: {
														date: new Date(),
														user: user._id,
														status: 'loaned'
													}
												}
											}, function ( err ) {
												if ( action.mode == 'item' ) {
													sendItemModule( socket, action.item );
												} else if ( action.mode == 'user' ) {
													sendUserModule( socket, action.user );
												}
											} );
										}
									} else {
										socket.emit( 'flash', { type: 'danger', message: 'Invalid user', barcode: item.barcode } );
										if ( action.mode == 'item' ) {
											sendItemModule( socket, action.item );
										} else if ( action.mode == 'user' ) {
											sendUserModule( socket, action.user );
										}
									}
								} );
								break;
							default:
								socket.emit( 'flash', { type: 'danger', message: 'Unknown error', barcode: item.barcode } );
								if ( action.mode == 'item' ) {
									sendItemModule( socket, action.item );
								} else if ( action.mode == 'user' ) {
									sendUserModule( socket, action.user );
								}
							break;
						}
					} else {
						socket.emit( 'flash', { type: 'danger', message: 'Item not found', barcode: action.item } );
						if ( action.mode == 'item' ) {
							sendItemModule( socket, action.item );
						} else if ( action.mode == 'user' ) {
							sendUserModule( socket, action.user );
						}
					}
				} );
			}
		} );
		socket.on( 'new-user', function( action ) {
			if ( this.request.session.user ) {
				if ( ! action.barcode ) {
					socket.emit( 'flash', { type: 'danger', message: 'No user barcode', barcode: 'Error' } );
					return;
				}
				if ( ! action.name ) {
					socket.emit( 'flash', { type: 'danger', message: 'No name specified', barcode: action.barcode } );
					sendNewUserModule( socket, action.barcode, action );
					return;
				}
				if ( ! action.email ) {
					socket.emit( 'flash', { type: 'danger', message: 'No email specified', barcode: action.barcode } );
					sendNewUserModule( socket, action.barcode, action );
					return;
				}
				if ( ! action.course ) {
					socket.emit( 'flash', { type: 'danger', message: 'No course specified', barcode: action.barcode } );
					sendNewUserModule( socket, action.barcode, action );
					return;
				}

				action._id = require( 'mongoose' ).Types.ObjectId();
				action.type = 'student';

				new Users( action ).save( function ( err ) {
					if ( err ) {
						if ( err.code == 11000 ) {
							socket.emit( 'flash', { type: 'danger', message: 'The user already exists', barcode: action.barcode } );
						} else {
							sendNewUserModule( socket, action.barcode, action );
							socket.emit( 'flash', { type: 'danger', message: 'Unknown error creating user', barcode: action.barcode } );
						}
					} else {
						sendUserModule( socket, action.barcode );
					}
				} );
			}
		} )
	} );
	return io;
};

function sendUserModule( socket, barcode, item_barcode ) {
	Users.findOne( { barcode: barcode } ).populate( 'course' ).exec( function( err, user ) {
		if ( user ) {
			Items.find().exec( function( err, items ) {
				var onloan = [];
				for ( item in items ) {
					item = items[item];
					if ( item.transactions != undefined ) {
						for ( t = item.transactions.length - 1; t >= 0; t-- ) {
							if ( item.transactions[t].user == user._id.toString() &&
								 item.transactions[t].status == 'loaned' ) {
								if ( t == item.transactions.length - 1 ) {
									onloan.push( item );
								}
							}
						}
					}
				}
				updateStats();
				var buttons = [];
				socket.emit( 'mode', {
					mode: 'user-selected',
					buttons: [ 'issue' ],
					data: {
						user: user.barcode,
						item: item_barcode
					}
				} );
				socket.emit( 'module', swig.renderFile( __dirname + '/../views/checkout/modules/user.swig', { user: user, onloan: onloan } ) );
			} );
		} else {
			sendNewUserModule( socket, barcode );
		};
	} );
}

function sendItemModule( socket, barcode, user_barcode ) {
	Items.findOne( { barcode: barcode } ).populate( 'department' ).populate( 'transactions.user' ).populate( 'group' ).exec( function( err, item ) {
		if ( item == null ) return;
		var buttons = [];

		switch ( item.status ) {
			case 'on-loan':
				var owner_transaction = 0;
				for ( i = item.transactions.length - 1; i >= 0; i-- ) {
					if ( item.transactions[ i ].status == 'loaned' ) {
						last_transaction = item.transactions[ i ];
						break;
					}
				}
				item.owner = last_transaction.user;
			case 'broken':
			case 'lost':
				buttons = [ 'return' ];
				break;
			case 'reserved':
				buttons = [ 'issue', 'return' ];
				break;
			case 'available':
				buttons = [ 'issue', 'reserve', 'broken', 'lost' ];
				break;
		}
		updateStats();
		socket.emit( 'mode', {
			mode: 'item-selected',
			buttons: buttons,
			data: {
				item: item.barcode,
				user: user_barcode
			}
		} );
		socket.emit( 'module', swig.renderFile( __dirname + '/../views/checkout/modules/item.swig', { item: item } ) );
	} );
}

function sendNewUserModule( socket, barcode, user ) {
	socket.emit( 'mode', {
		mode: 'new-user',
		buttons: [],
		data: {}
	} );
	Courses.find( function( err, courses ) {
		if ( user == undefined )
			user = { barcode: barcode };
		socket.emit( 'module', swig.renderFile( __dirname + '/../views/checkout/modules/new-user.swig', { user: user, courses: courses } ) );
	} );
}

function updateStats() {
	Items.find( {}, function( err, items ) {
		var issued = 0,
		returned = 0,
		available = 0,
		onloan = 0,
		lostbroken = 0,
		scanned = 0,
		unscanned = 0;

		for ( var i = 0; i < items.length; i++ ) {
			var item = items[i];
			if ( item.status == 'available' ) available++;
			if ( item.status == 'on-loan' ) onloan++;
			if ( item.status == 'lost' ) lostbroken++;
			if ( item.status == 'broken' ) lostbroken++;
			if ( item.audited == true ) {
				scanned++;
			} else {
				switch ( item.status ) {
					case 'available':
					case 'broken':
					case 'new':
					case 'reserved':
					default:
						unscanned++;
						break;
					case 'on-loan':
					case 'lost':
						scanned++;
				}
			}

			var loaned_today = false;
			var returned_today = false;
			var today = new Date();
			today.setHours( 0, 0, 0, 0 );
			for ( var t = 0; t < item.transactions.length; t++ ) {
				var transaction = item.transactions[t];
				if ( transaction != undefined ) {
					if ( transaction.date > today ) {
						if ( transaction.status == 'loaned' ) loaned_today = true;
						if ( transaction.status == 'returned' ) returned_today = true;
					}
				}
			}
			if ( loaned_today == true ) issued++;
			if ( returned_today == true ) returned++;
		}

		io.emit( 'stats', {
			issued: issued,
			returned: returned,
			available: available,
			onloan: onloan,
			lostbroken: lostbroken,
			audit: scanned + '/' + unscanned
		} )
	} );
}
