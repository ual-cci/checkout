var __home = __dirname + '/../..';
var __src = __home + '/src';
var __js = __src + '/js';
var __views = __src + '/views';

var sio = require( 'socket.io' );
var pug = require( 'pug' );
var moment = require( 'moment' );

var db = require( __js + '/database' ),
	ObjectId = db.ObjectId,
	Items = db.Items,
	Users = db.Users,
	Courses = db.Courses,
	Departments = db.Departments;

module.exports = function( server ) {
	var io = sio.listen( server );
	io.on( 'connection', connected );
	return io;
};

function connected( socket ) {
	socket.on( 'identify', function( find ) {
		if ( socket.request.user ) {
			Users.findOne( { barcode: find }, function( err, user ) {
				if ( user != undefined ) {
					socket.emit( 'mode', { mode: 'user', buttons: [] } );
					return;
				}
				Items.findOne( { barcode: find }, function ( err, item ) {
					if ( item != undefined ) {
						socket.emit( 'mode', { mode: 'item', buttons: [] } );
						return;
					} else {
						socket.emit( 'mode', { mode: 'find', buttons: [] } );
					}
				} );
			} );
		}
	} );
	socket.on( 'audit', function ( action ) {
		if ( socket.request.user ) {
			if ( action.item ) {
				var loggedInUser = socket.request.user;
				Items.findOne( { barcode: action.item }, function( err, item ) {
					if ( item == undefined ) {
						socket.emit( 'flash', { type: 'danger', message: 'Unknown item', barcode: action.item } );
						return;
					} else if ( item.status == 'lost' ) {
						socket.emit( 'flash', { type: 'danger', message: 'Item currently marked as lost', barcode: 'Error' } );
						return;
					} else if ( item.status == 'on-loan' ) {
						socket.emit( 'flash', { type: 'danger', message: 'Item currently marked as on loan', barcode: 'Error' } );
						return;
					}

					Departments.findOne( { _id: action.department }, function( err, department ) {
						var update = {};
						update['$push'] = {
							transactions: {
								date: new Date(),
								user: loggedInUser.id,
								status: 'audited'
							}
						};

						if ( department ) {
							update['$set'] = {
								'department': department._id
							}
						}

						Items.update( { _id: item._id }, update ).then ( function ( status ) {
							if ( status.n == 1 ) {
								socket.emit( 'flash', { type: 'success', message: 'Audited', barcode: item.barcode } );
								if ( department && item.department.toString() != department._id.toString() ) socket.emit( 'flash', { type: 'info', message: 'Moved to ' + department.name, barcode: item.barcode } );
							} else {
								socket.emit( 'flash', { type: 'danger', message: 'Not found', barcode: item.barcode } );
							}
						}, function ( err ) {
							socket.emit( 'flash', { type: 'danger', message: 'Unknown item', barcode: item.barcode } );
						} );
					} );
				} )
			} else {
				socket.emit( 'flash', { type: 'danger', message: 'Format invalid', barcode: action.itemBarcode } );
			};
		}
	} )
	socket.on( 'user', function( barcode ) {
		if ( socket.request.user ) {
			sendUserModule( socket, barcode );
		}
	} );
	socket.on( 'item', function( barcode ) {
		if ( socket.request.user ) {
			sendItemModule( socket, barcode );
		}
	} );
	socket.on( 'broken', function( action ) {
		if ( socket.request.user ) {
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
							user: socket.request.user._id,
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
		}
	} );
	socket.on( 'lost', function( action ) {
		if ( socket.request.user ) {
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
							user: socket.request.user._id,
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
		}
	} );
	socket.on( 'return', function( action ) {
		if ( socket.request.user ) {
			var multireturn = action.mode == 'multi-return' ? true : false;
			var itemFilter = {};
			var loggedInUser = socket.request.user;
			Items.findOne( { barcode: action.item }, function( err, item ) {
				if ( item != null ) {
					if ( item.status == 'available' ) {
						socket.emit( 'flash', { type: 'warning', message: 'Item already returned', barcode: item.barcode } );
						sendItemModule( socket, action.item, null, multireturn );
						return;
					} else if ( item.status == 'new' ) {
						socket.emit( 'flash', { type: 'danger', message: 'Item has not yet been activated, audit the item before returning it', barcode: item.barcode } );
						sendItemModule( socket, action.item, null, multireturn );
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
						if ( multireturn )
							socket.emit( 'flash', { type: 'success', message: 'Item returned', barcode: item.barcode } );
						sendItemModule( socket, action.item, null, multireturn );
					} );
				}
			} );
		}
	} );
	socket.on( 'reserve', function( action ) {
		if ( socket.request.user ) {
			var loggedInUser = socket.request.user;
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
						// User: Disabled
						if ( user.disable ) {
							socket.emit( 'flash', { type: 'danger', message: 'User has been disabled.', barcode: item.barcode } );
							return;
						}
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
		if ( socket.request.user ) {
			var loggedInUser = socket.request.user;
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
							// Find user
							Users.findOne( { barcode: action.user }, function( err, user ) {
								// Check user was found
								if ( user != null ) {
									// User: Disabled
									if ( user.disable ) {
										socket.emit( 'flash', { type: 'danger', message: 'User has been disabled.', barcode: item.barcode } );
										return;
									}
									// Item: Reserved by another user
									if ( item.status == 'reserved' &&
										 user.id != item.transactions[ item.transactions.length - 1 ].user ) {
										socket.emit( 'flash', { type: 'danger', message: 'Item is currently reserved by another user', barcode: item.barcode } );
										if ( action.mode == 'item' ) {
											sendItemModule( socket, action.item );
										} else if ( action.mode == 'user' ) {
											sendUserModule( socket, action.user );
										}
										return;
									}
									// User: Terms and conditions
									if ( user.read_tc != true && action.override != true ) {
										socket.emit( 'flash', {
											type: 'warning',
											message: 'Has the user read the loan agreement?',
											barcode: user.name,
											timer: 15000,
											btn: {
												text: 'Yes',
												class: 'read_tc'
											}
										} );
										if ( action.mode == 'item' ) {
											sendItemModule( socket, action.item, action.user );
										} else if ( action.mode == 'user' ) {
											sendUserModule( socket, action.user, action.item );
										}
										return;
									}
									// Item: Part of a group
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
													timer: 15000,
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
		if ( socket.request.user ) {
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
	socket.on( 'read_tc', function( action ) {
		if ( socket.request.user ) {
			if ( ! action.user ) {
				socket.emit( 'flash', { type: 'danger', message: 'No user barcode', barcode: 'Error' } );
				return;
			}
			Users.findOne( { barcode: action.user }, function( err, user ) {
				user.read_tc = true;
				user.save( function( err ) {
					socket.emit( 'flash', { type: 'success', message: 'User has read loan agreement.', barcode: user.name } );
				} );
			} );
		}
	} )
}

function sendUserModule( socket, barcode, item_barcode ) {
	Users.findOne( { barcode: barcode } ).populate( 'course' ).exec( function( err, user ) {
		if ( user == null ) {
			socket.emit( 'flash', { type: 'danger', message: 'Unknown user', barcode: barcode } );
			return;
		}

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
			var buttons = [];
			socket.emit( 'mode', {
				mode: 'user-selected',
				buttons: [ 'issue' ],
				data: {
					user: user.barcode,
					item: item_barcode
				}
			} );
			socket.emit( 'module', pug.renderFile( __views + '/modules/user.pug', { user: user, onloan: onloan, moment: moment } ) );
		} );
	} );
}

function sendItemModule( socket, barcode, user_barcode, multireturn ) {
	Items.findOne( { barcode: barcode } ).populate( 'department' ).populate( 'transactions.user' ).populate( 'group' ).exec( function( err, item ) {
		if ( item == null ) {
			socket.emit( 'flash', { type: 'danger', message: 'Unknown item', barcode: barcode } );
			return;
		}
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
		socket.emit( 'mode', {
			mode: multireturn ? 'multi-return' : 'item-selected',
			buttons: multireturn ? [ 'multi-return' ] : buttons,
			data: {
				item: item.barcode,
				user: user_barcode
			}
		} );
		socket.emit( 'module', pug.renderFile( __views + '/modules/item.pug', { item: item } ) );
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
		socket.emit( 'module', pug.renderFile( __views + '/modules/new-user.pug', { user: user, courses: courses } ) );
	} );
}
