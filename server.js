var config = require( './config.json' );
var mongoose = require( 'mongoose' ),
	courses = require( __dirname + '/apps/courses' ),
	users = require( __dirname + '/apps/users' ),
	departments = require( __dirname + '/apps/departments' ),
	items = require( __dirname + '/apps/items' ),
	groups = require( __dirname + '/apps/groups' ),
	reports = require( __dirname + '/apps/reports' ),
	profile = require( __dirname + '/apps/profile' ),
	checkout = require( __dirname + '/apps/checkout' );
var	express = require( 'express' ),
	flash = require( 'express-flash' ),
	add_flash = require( 'add-flash' ),
	session = require( 'express-session' ),
	body = require('body-parser'),
	cookie = require('cookie-parser'),
	swig = require( 'swig' );
var app = express(),
	http = require( 'http' ).Server( app );
var	io = require( 'socket.io' )( http )

// Connect to Mongo
mongoose.connect( config.mongo );

var Courses = require( __dirname + '/models/courses' );
var Users = require( __dirname + '/models/users' );
var Departments = require( __dirname + '/models/departments' );
var Items = require( __dirname + '/models/items' );
var Groups = require( __dirname + '/models/groups' );

app.use( express.static( __dirname + '/static' ) );
app.use( body.json() );
app.use( body.urlencoded( { extended: true } ) );
app.use( cookie() );
var sessionMiddleware = session( {
	secret: config.secret,
	cookie: { maxAge: 31*24*60*60*1000 },
	saveUninitialized: false,
	resave: false,
	rolling: true
} );
app.use( sessionMiddleware );
io.use( function( socket, next ) {
    sessionMiddleware( socket.request, socket.request.res, next );
} );
app.use( flash() );
app.use( add_flash() );

// Configure Swig
app.engine( 'swig', swig.renderFile );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'swig' );
app.set( 'view cache', false );
swig.setDefaults( { cache: false } );

app.use( function( req, res, next ) {
	if ( config.dev ) res.locals.dev = true;
	res.locals.currentModule = 'checkout';
	res.locals.loggedInUser = req.session.user;
	next();
} );

app.use( courses.path, courses );
app.use( users.path, users );
app.use( departments.path, departments );
app.use( items.path, items );
app.use( groups.path, groups );
app.use( reports.path, reports );
app.use( profile.path, profile );
app.use( checkout.path, checkout );

// Handle Index
app.get( '/', function ( req, res ) {
	if ( req.session.user ) {
		res.render( 'dashboard' );
	} else {
		res.redirect( '/login' );
	}
} );

// Handle Index
app.get( '/login', function ( req, res ) {
	res.render( 'login' );
} );

// Handle Index
app.post( '/login', function ( req, res ) {
	Users.findOne( { barcode: req.body.id }, function( err, user ) {
		if ( user ) {
			var loggedInUser = {
				id: user._id,
				name: user.name,
				isStaff: user.type == 'staff' || user.type == 'admin' ? true : false,
				isAdmin: user.type == 'admin' ? true : false
			}
			req.session.user = loggedInUser;
			res.redirect( req.session.requested ? req.session.requested : '/' );
			req.session.requested = '';
		} else {
			req.add_flash( 'danger', 'Invalid user' );
			res.redirect( '/login' );
		}
	} )
} );

// Handle logout
app.get( '/logout', function ( req, res ) {
	delete req.session.user;
	delete req.session.requested;
	res.redirect( '/' );
} );

// Handle Socket connection
io.on( 'connection', function( socket ) {
	// Issue
	socket.on( 'issue', function( action ) {
		if ( this.request.session.user ) {
			var loggedInUser = this.request.session.user;
			var itemFilter = {};
			if ( action.itemBarcode ) itemFilter.barcode = action.itemBarcode;
			if ( action.itemId ) itemFilter._id = action.itemId;

			Items.findOne( itemFilter ).populate( 'group' ).exec( function( err, item ) {
				switch ( item.status ) {
					case 'on-loan':
						socket.emit( 'flash', { type: 'danger', message: 'Item on loan to another user', barcode: item.barcode } );
						break;
					case 'broken':
						socket.emit( 'flash', { type: 'danger', message: 'Item is currently broken', barcode: item.barcode } );
						break;
					case 'new':
						socket.emit( 'flash', { type: 'danger', message: 'Item has not yet been activated, audit the item before issuing it', barcode: item.barcode } );
						break;
					case 'reserved':
					case 'available':
						var userFilter = {};
						if ( action.userBarcode ) userFilter.barcode = action.userBarcode;
						if ( action.userId ) userFilter._id = action.userId;

						Users.findOne( userFilter, function( err, user ) {
							if ( user != null ) {
								if ( item.status == 'reserved' ) {
									if ( user.id != item.transactions[ item.transactions.length - 1 ].user ) {
										socket.emit( 'flash', { type: 'danger', message: 'Item is currently reserved by another user', barcode: item.barcode } );
										return;
									}
								}
								if ( loggedInUser.isStaff || loggedInUser.id == user._id ) {
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
											if ( count >= item.group.limiter ) {
												socket.emit( 'flash', { type: 'danger', message: 'You already have ' + count + ' of this type of item out.', barcode: item.barcode } );
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
													socket.emit( 'flash', { type: 'success', message: 'Item checked out', barcode: item.barcode } );
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
											socket.emit( 'flash', { type: 'success', message: 'Item checked out', barcode: item.barcode } );
										} );
									}
								} else {
									socket.emit( 'flash', { type: 'danger', message: 'Only staff can issue items to other users', barcode: item.barcode } );
								}
							} else {
								socket.emit( 'flash', { type: 'danger', message: 'Invalid user', barcode: item.barcode } );
							}
						} );
						break;
					default:
						socket.emit( 'flash', { type: 'danger', message: 'Unknown error', barcode: item.barcode } );
						break;
				}
			} );
		}
	} );

	// Reserve
	socket.on( 'reserve', function( action ) {
		if ( this.request.session.user ) {
			var loggedInUser = this.request.session.user;
			Items.findOne( { _id: action.item }, function( err, item ) {
				if ( item == undefined ) {
					socket.emit( 'flash', { type: 'danger', message: 'Item not found', barcode: action.item } );
					return;
				}

				if ( item.status == 'reserved' ) {
					socket.emit( 'flash', { type: 'warning', message: 'Item already reserved', barcode: item.barcode } );
					return;
				} else if ( item.status == 'new' ) {
					socket.emit( 'flash', { type: 'warning', message: 'Item has not yet been activated, audit item before reserving it', barcode: item.barcode } );
					return;
				} else if ( item.status == 'broken' ) {
					socket.emit( 'flash', { type: 'warning', message: 'Item is broken, return it before reserving it', barcode: item.barcode } );
					return;
				}

				Users.findOne( { barcode: action.user }, function( err, user ) {
					if ( user != null ) {
						Items.update( { _id: action.item }, {
							$push: {
								transactions: {
									date: new Date(),
									user: user._id,
									status: 'reserved'
								}
							}
						} ).then( function ( status ) {
							if ( status.n == 1 ) {
								socket.emit( 'flash', { type: 'success', message: 'Item reserved', barcode: item.barcode } );
							} else {
								socket.emit( 'flash', { type: 'danger', message: 'There was an error reserving the item', barcode: item.barcode } );
							}
						}, function ( status ) {
							socket.emit( 'flash', { type: 'danger', message: 'There was an error reserving the item', barcode: item.barcode } );
						} );
					} else {
						socket.emit( 'flash', { type: 'danger', message: 'Invalid user', barcode: item.barcode } );
					}
				} );
			} );
		}
	} );

	// Return
	socket.on( 'return', function( action ) {
		if ( this.request.session.user ) {
			var itemFilter = {};
			if ( action.itemBarcode ) itemFilter.barcode = action.itemBarcode;
			if ( action.itemId ) itemFilter._id = action.itemId;

			var loggedInUser = this.request.session.user;
			Items.findOne( itemFilter, function( err, item ) {
				if ( item.status == 'available' ) {
					socket.emit( 'flash', { type: 'warning', message: 'Item already returned', barcode: item.barcode } );
					return;
				} else if ( item.status == 'new' ) {
					socket.emit( 'flash', { type: 'danger', message: 'Item has not yet been activated, audit the item before returning it', barcode: item.barcode } );
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
					socket.emit( 'flash', { type: 'success', message: 'Item returned', barcode: item.barcode } );
				} );
			} );
		}
	} );

	// Broken
	socket.on( 'broken', function( action ) {
		if ( this.request.session.user ) {
			var itemFilter = {};
			if ( action.itemBarcode ) itemFilter.barcode = action.itemBarcode;
			if ( action.itemId ) itemFilter._id = action.itemId;

			var loggedInUser = this.request.session.user;
			Items.findOne( itemFilter, function( err, item ) {
				if ( item.status == 'broken' ) {
					socket.emit( 'flash', { type: 'warning', message: 'Item already marked as broken', barcode: item.barcode } );
					return;
				} else if ( item.status == 'new' ) {
					socket.emit( 'flash', { type: 'warning', message: 'Item has not yet been activated, audit the item before marking it as broken', barcode: item.barcode } );
					return;
				}
				Items.update( { _id: item._id }, {
					$push: {
						transactions: {
							date: new Date(),
							user: loggedInUser.id,
							status: 'broken'
						}
					}
				} ).then( function ( status ) {
					if ( status.n == 1 ) {
						socket.emit( 'flash', { type: 'success', message: 'Item marked as broken', barcode: item.barcode } );
					} else {
						socket.emit( 'flash', { type: 'danger', message: 'There was an error updating the item', barcode: item.barcode } );
					}
				}, function ( status ) {
					socket.emit( 'flash', { type: 'danger', message: 'There was an error updating the item', barcode: item.barcode } );
				} );
			} );
		}
	} );

	socket.on( 'audit', function ( action ) {
		if ( this.request.session.user && this.request.session.user.isStaff ) {
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

	if ( socket.request.session.user ) {
		// User
		socket.on( 'user', function( barcode ) {
			if ( barcode.substring( 0, 4 ) == '1234' && barcode.length == 12 ) {
				Users.findOne( { barcode: barcode } ).populate( 'course' ).exec( function( err, user ) {
					if ( user ) {
						if ( socket.request.session.user.isStaff  ) {
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
								socket.emit( 'user', swig.renderFile( __dirname + '/views/users/partials/info-modal.swig', { user: user, onloan: onloan } ) );
							} );
						}
					} else {
						socket.emit( 'create', '/users/create?barcode=' + barcode );
					};
				} );
			}
		} );

		// Item
		socket.on( 'item', function( barcode ) {
			if ( /([A-Z]{2,4}) ([0-9]{2})/.exec( barcode ) != null ) {
				Items.findOne( { barcode: barcode } ).populate( 'transactions.user' ).populate( 'department' ).exec( function( err, item ) {
					if ( item == null ) return;
					if ( socket.request.session.user.isStaff ) {
						socket.emit( 'item', swig.renderFile( __dirname + '/views/items/partials/info-modal.swig', { item: item, modal: '/' } ) );
					} else {
						socket.emit( 'item', swig.renderFile( __dirname + '/views/items/partials/info-modal-minimal.swig', { item: item, modal: '/' } ) );
					}
				} );
			}
		} );
	} else {
		socket.on( 'item', function( msg ) {
			socket.emit( 'create', '/login' );
		} )
		socket.on( 'user', function( msg ) {
			socket.emit( 'create', '/login' );
		} )
	}
} );

// Start server
http.listen( config.port, function() {
	console.log( 'Server started.' );
} );
