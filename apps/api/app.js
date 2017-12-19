var __home = __dirname + "/../..";
var __config = __home + '/config/config.json';
var __src = __home + '/src';
var __js = __src + '/js';
var __views = __src + '/views';

var config = require( __config );

var	express = require( 'express' ),
	app = express();

var pug = require( 'pug' ),
	moment = require( 'moment' );

var Print = require( __js + '/print' );

var db = require( __js + '/database' ),
	Items = db.Items,
	Users = db.Users,
	Departments = db.Departments,
	Courses = db.Courses,
	Years = db.Years;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/search/:term', auth.isLoggedIn, function( req, res ) {
	Users.find( { $or: [
		{ name: { $regex: '.*' + req.params.term + '.*', $options: 'i' } },
		{ barcode: { $regex: '.*' + req.params.term + '.*', $options: 'i' } }
	] } ).sort( { disable: 1, name: 1 } ).select( [ 'name', 'barcode', 'disable' ] ).exec( function( err, users ) {
		Items.find( { $or: [
			{ name: { $regex: '.*' + req.params.term + '.*', $options: 'i' } },
			{ barcode: { $regex: '.*' + req.params.term + '.*', $options: 'i' } }
		] }, function( err, items ) {
			var cleanItems = [];

			for ( var i in items ) {
				var item = {
					_id: items[i]._id,
					name: items[i].name,
					barcode: items[i].barcode,
					status: items[i].status
				}
				cleanItems.push( item );
			}

			res.json( {
				query: req.params.term,
				users: users,
				items: cleanItems,
			} );
		} );
	} );
} );

app.get( '/identify/:term', auth.isLoggedIn, function( req, res ) {
	Users.findOne( { barcode: req.params.term }, function( err, user ) {
		if ( user != undefined ) {
			return res.json( {
				kind: 'user',
				barcode: user.barcode
			} );
		}
		Items.findOne( { barcode: req.params.term }, function ( err, item ) {
			if ( item != undefined ) {
				return res.json( {
					kind: 'item',
					barcode: item.barcode
				} );
			} else {
				return res.json( {
					kind: 'unknown'
				} );
			}
		} );
	} );
} );

app.get( '/user/:barcode', auth.isLoggedIn, function( req, res ) {
	Users.findOne( { barcode: req.params.barcode, disable: { $ne: true } } ).populate( 'course' ).populate( 'year' ).exec( function ( err, user ) {
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
				var html = pug.renderFile( __views + '/modules/user.pug', { user: user, onloan: onloan, moment: moment } ) ;

				var output = {
					type: 'user',
					id: user._id,
					barcode: user.barcode,
					name: user.name,
					email: user.email,
					course: user.course,
					html: html
				};

				return res.json( output );
			} );
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown user',
				barcode: req.params.barcode
			} );
		}
	} );
} );

app.get( '/item/:barcode', auth.isLoggedIn, function( req, res ) {
	Items.findOne( { barcode: req.params.barcode } )
		.populate( 'group' )
		.populate( 'department' )
		.populate( 'transactions.user' )
		.exec( function ( err, item ) {
		if ( item ) {
			if ( item.status == 'on-loan' ) {
				if ( item.transactions && item.transactions.length ) {
					var last = item.transactions[item.transactions.length - 1];
					item.owner = {
						_id: last.user._id,
						name: last.user.name,
						barcode: last.user.barcode
					};
				}
			}

			var html = pug.renderFile( __views + '/modules/item.pug', { item: item } );

			var output = {
				type: 'item',
				id: item._id,
				barcode: item.barcode,
				department: item.department,
				group: item.group,
				status: item.status,
				owner: item.owner,
				html: html
			};

			return res.json( output );
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown item',
				barcode: req.params.barcode
			} );
		}
	} );
} );

app.post( '/audit/:item', auth.isLoggedIn, function( req, res ) {
	Items.findOne( { barcode: req.params.item }, function( err, item ) {
		if ( item == undefined ) {
			return res.json( {
				status: 'danger',
				message: 'Unknown item',
				barcode: req.params.item
			} );
		} else if ( item.status == 'lost' ) {
			return res.json( {
				status: 'danger',
				message: 'Item currently marked as lost',
				barcode: item.barcode
			} );
		} else if ( item.status == 'on-loan' ) {
			return res.json( {
				status: 'danger',
				message: 'Item currently marked as on loan',
				barcode: item.barcode
			} );
		}

		Departments.findOne( { _id: req.body.department }, function( err, department ) {
			var update = {};
			update['$push'] = {
				transactions: {
					date: new Date(),
					user: req.user.id,
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
					if ( department && item.department.toString() != department._id.toString() ) {
						return res.json( {
							status: 'success',
							message: 'Item audited and transfered to ' + department.name,
							barcode: item.barcode
						} );
					} else {
						return res.json( {
							status: 'success',
							message: 'Item audited',
							barcode: item.barcode
						} );
					}
				} else {
					return res.json( {
						status: 'danger',
						message: 'Item not found',
						barcode: item.barcode
					} );
				}
			}, function ( err ) {
				return res.json( {
					status: 'danger',
					message: 'Item not found',
					barcode: item.barcode
				} );
			} );
		} );
	} );
} );

app.post( '/return/:item', auth.isLoggedIn, function( req, res ) {
	Items.findOne( { barcode: req.params.item }, function( err, item ) {
		if ( item != null ) {
			if ( item.status == 'available' ) {
				return res.json( {
					status: 'warning',
					message: 'Item already returned',
					barcode: item.barcode
				} );
			}
			Items.update( { _id: item._id }, {
				$push: {
					transactions: {
						date: new Date(),
						user: req.user.id,
						status: 'returned'
					}
				}
			}, function ( err ) {
				return res.json( {
					status: 'success',
					message: 'Item returned',
					barcode: item.barcode
				} );
			} );
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown item',
				barcode: req.params.item
			} );
		}
	} );
} );

app.post( '/broken/:item', auth.isLoggedIn, function( req, res ) {
	Items.findOne( { barcode: req.params.item }, function( err, item ) {
		if ( item ) {
			if ( item.status == 'broken' ) {
				return res.json( {
					status: 'warning',
					message: 'Item already marked as broken',
					barcode: item.barcode
				} );
				return;
			}
			Items.update( { _id: item._id }, {
				$push: {
					transactions: {
						date: new Date(),
						user: req.user.id,
						status: 'broken'
					}
				}
			} ).then( function ( status ) {
				if ( status.n == 1 ) {
					return res.json( {
						status: 'success',
						message: 'Item marked as broken',
						barcode: item.barcode
					} );
				} else {
					return res.json( {
						status: 'danger',
						message: 'There was an error updating the item',
						barcode: item.barcode
					} );
				}
			}, function ( status ) {
				return res.json( {
					status: 'danger',
					message: 'There was an error updating the item',
					barcode: item.barcode
				} );
			} );
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown item',
				barcode: item.barcode
			} );
		}
	} );
} );

app.post( '/lost/:item', auth.isLoggedIn, function( req, res ) {
	Items.findOne( { barcode: req.params.item }, function( err, item ) {
		if ( item ) {
			if ( item.status == 'lost' ) {
				return res.json( {
					status: 'warning',
					message: 'Item already marked as lost',
					barcode: item.barcode
				} );
				return;
			}
			Items.update( { _id: item._id }, {
				$push: {
					transactions: {
						date: new Date(),
						user: req.user.id,
						status: 'lost'
					}
				}
			} ).then( function ( status ) {
				if ( status.n == 1 ) {
					return res.json( {
						status: 'success',
						message: 'Item marked as lost',
						barcode: item.barcode
					} );
				} else {
					return res.json( {
						status: 'danger',
						message: 'There was an error updating the item',
						barcode: item.barcode
					} );
				}
			}, function ( status ) {
				return res.json( {
					status: 'danger',
					message: 'There was an error updating the item',
					barcode: item.barcode
				} );
			} );
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown item',
				barcode: item.barcode
			} );
		}
	} );
} );

app.post( '/issue/:item/:user', auth.isLoggedIn, function( req, res ) {
	Items.findOne( { barcode: req.params.item } ).populate( 'group' ).exec( function( err, item ) {
		if ( item != undefined ) {
			switch ( item.status ) {
				case 'on-loan':
					return res.json( {
						status: 'danger',
						message: 'Item already on loan',
						barcode: item.barcode
					} );
				case 'lost':
					return res.json( {
						status: 'danger',
						message: 'Item is currently lost',
						barcode: item.barcode
					} );
				case 'broken':
					return res.json( {
						status: 'danger',
						message: 'Item is currently broken',
						barcode: item.barcode
					} );
				case 'available':
					// Find user
					Users.findOne( { barcode: req.params.user }, function( err, user ) {
						// Check user was found
						if ( user != null ) {
							// User: Disabled
							if ( user.disable ) {
								return res.json( {
									status: 'danger',
									message: 'User has been disabled',
									barcode: item.barcode
								} );
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
									if ( count >= item.group.limiter && req.body.override ) {
										return res.json( {
											status: 'danger',
											message: 'You already have ' + count + ' of this type of item out.',
											barcode: item.barcode
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
											return res.json( {
												status: 'success',
												message: 'Item issued',
												barcode: item.barcode
											} );
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
									return res.json( {
										status: 'success',
										message: 'Item issued',
										barcode: item.barcode
									} );
								} );
							}
						} else {
							return res.json( {
								status: 'danger',
								message: 'Invalid user',
								barcode: item.barcode
							} );
						}
					} );
					break;
				default:
					return res.json( {
						status: 'danger',
						message: 'Unknown error',
						barcode: item.barcode
					} );
				break;
			}
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown item',
				barcode: req.params.item
			} );
		}
	} );
} );

app.post( '/label/:item', auth.isLoggedIn, function( req, res ) {
	Items.findOne( { barcode: req.params.item }, function( err, item ) {
		if ( item ) {
			console.log( item );
			if ( req.user.printer ) {
				Print.label( item.barcode, req.user.printer.url );
				return res.json( {
					status: 'success',
					message: 'Label printed to ' + req.user.printer.name,
					barcode: item.barcode
				} );
			} else {
				return res.json( {
					status: 'warning',
					message: 'You have not assigned a printer in your profile',
					barcode: item.barcode
				} );
			}
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown item',
				barcode: req.params.item
			} );
		}
	} );
} );

app.post( '/new-user', auth.isLoggedIn, function( req, res ) {
	if ( ! req.body.name ) {
		return res.json( {
			status: 'danger',
			message: 'The user must have a name'
		} );
	} else if ( ! req.body.barcode ) {
		return res.json( {
			status: 'danger',
			message: 'The user must have a unique barcode'
		} );
	} else if ( ! req.body.email ) {
		return res.json( {
			status: 'danger',
			message: 'The user must have an email address'
		} );
	}

	Courses.findById( req.body.course, function( err, course ) {
		if ( ! course ) {
			return res.json( {
				status: 'danger',
				message: 'The user must be assigned to a course'
			} );
		}
		Years.findById( req.body.year, function( err, year ) {
			 if ( ! year ) {
				return res.json( {
					status: 'danger',
					message: 'The user must be assigned to a year'
				} );
			}

			var user = {
				_id: require( 'mongoose' ).Types.ObjectId(),
				name: req.body.name,
				type: 'student',
				barcode: req.body.barcode,
				email: req.body.email,
				course: course._id,
				year: year._id,
				printer: req.body.printer ? ObjectId( req.body.printer ) : null
			}

			new Users( user ).save( function ( err, result ) {
				if ( err ) {
					if ( err.code == 11000 ) {
						return res.json( {
							status: 'danger',
							message: 'The user barcode must be unique'
						} );
					} else {
						console.log( err );
						return res.json( {
							status: 'danger',
							message: 'Error creating user'
						} );
					}
				} else {
					return res.json( {
						status: 'success',
						message: 'User created',
						redirect: {
							type: 'user',
							barcode: result.barcode
						}
					} );
				}
			} );
		} );
	} );
} );

module.exports = function( config ) { return app; };
