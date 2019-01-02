var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';
var __views = __src + '/views';


var	express = require( 'express' ),
	app = express();

var pug = require( 'pug' ),
	moment = require( 'moment' );

var Print = require( __js + '/print' );

const Items = require('../../src/models/items.js');
const Users = require('../../src/models/users.js');
const Departments = require('../../src/models/departments.js');
const Courses = require('../../src/models/courses.js');
const Years = require('../../src/models/years.js');
const Actions = require('../../src/models/actions.js');

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/search/:term', auth.isLoggedIn, function( req, res ) {
	Users.search( req.params.term, function( err, users ) {
		Items.search( req.params.term, function( err, items ) {
			res.json( {
				query: req.params.term,
				users: users,
				items: items,
			} );
		} );
	} );
} );

app.get( '/identify/:term', auth.isLoggedIn, function( req, res ) {
	Users.getByBarcode( req.params.term, function( err, user ) {
		if ( user != undefined ) {
			return res.json( {
				kind: 'user',
				barcode: user.barcode
			} );
		}
		Items.getByBarcode( req.params.term, function ( err, item ) {
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
	var opts = {
		lookup: [ 'course', 'year' ]
	};

	Users.getByBarcode( req.params.barcode, opts, function ( err, user ) {
		if ( user ) {
			Items.getOnLoanToUserId( user.id, function( err, items ) {
				var html = pug.renderFile( __views + '/modules/user.pug', {
					user: user,
					onloan: items,
					moment: moment
				} ) ;

				var output = {
					type: 'user',
					id: user.id,
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
	var opts = {
		lookup: [ 'group', 'location', 'owner' ]
	}

	Items.getByBarcode( req.params.barcode, opts, function ( err, item ) {
		if ( item ) {
			var html = pug.renderFile( __views + '/modules/item.pug', { item: item } );

			var output = {
				type: 'item',
				id: item.id,
				barcode: item.barcode,
				location: item.location_id,
				group: item.group_id,
				status: item.status,
				owner_id: item.owner_id,
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
	Items.getByBarcode( req.params.item, {
		lookup: [ 'location' ]
	}, function( err, item ) {
		if ( item ) {
			var audit = false;

			// No location
			if ( ! req.body.location ) audit = true;
			// Overriden
			if ( req.body.override && req.body.override == 'true' ) audit = true;
			// Location unchanged
			if ( req.body.location == item.location_id  ) audit = true;

			if ( audit ) {
				Items.audit( req.params.item, function( msg, item ) {
					if ( msg.status == 'success' ) {
						var output = {
							status: msg.status,
							message: msg.message
						};
						if ( item ) {
							output.barcode = item.barcode;

							if ( req.body.location ) {
								Locations.getById( req.body.location, function( err, location ) {
									if ( location ) {
										Items.update( item.id, {
											location_id: location.id
										}, function( err ) {} )
									}
								} );
							}

							Actions.log( {
								item_id: item.id,
								datetime: new Date(),
								action: 'audited',
								operator_id: req.user.id
							}, function( err ) {} );
						}

						return res.json( output );
					} else {
						var output = {
							status: msg.status,
							message: msg.message
						};
						return res.json( output );
					}
				} );
			} else {
				var output = {
					barcode: item.barcode,
					status: 'danger',
					message: 'Item is in the wrong location, should be: <strong>' + item.location_name + '</strong> (' + item.location_barcode + ')'
				};
				return res.json( output );
			}
		} else {
			var output = {
				status: 'danger',
				message: 'Unknown item'
			};
			return res.json( output );
		}
	} )
} );

app.post( '/return/:item', auth.isLoggedIn, function( req, res ) {
	Items.return( req.params.item, function( msg, item ) {
		if ( msg.status == 'success' ) {
			var output = {
				status: msg.status,
				message: msg.message
			};
			if ( item ) {
				output.barcode = item.barcode;
				var action = 'returned';
				switch ( item.status ) {
					case 'broken':
						action = 'repaired';
						break;
					case 'lost':
						action = 'found';
						break;
				}

				Actions.log( {
					item_id: item.id,
					datetime: new Date(),
					action: action,
					operator_id: req.user.id,
					user_id: item.owner_id
				}, function( err ) {} );
			}

			return res.json( output );
		} else {
			var output = {
				status: msg.status,
				message: msg.message
			};
			return res.json( output );
		}
	} );
} );

app.post( '/broken/:item', auth.isLoggedIn, function( req, res ) {
	Items.broken( req.params.item, function( msg, item ) {
		if ( msg.status == 'success' ) {
			var output = {
				status: msg.status,
				message: msg.message
			};
			if ( item ) {
				output.barcode = item.barcode;
				Actions.log( {
					item_id: item.id,
					datetime: new Date(),
					action: 'broken',
					operator_id: req.user.id
				}, function( err ) {} );
			}

			return res.json( output );
		} else {
			var output = {
				status: msg.status,
				message: msg.message
			};
			return res.json( output );
		}
	} );
} );

app.post( '/lost/:item', auth.isLoggedIn, function( req, res ) {
	Items.lost( req.params.item, function( msg, item ) {
		if ( msg.status == 'success' ) {
			var output = {
				status: msg.status,
				message: msg.message
			};
			if ( item ) {
				output.barcode = item.barcode;
				Actions.log( {
					item_id: item.id,
					datetime: new Date(),
					action: 'lost',
					operator_id: req.user.id
				}, function( err ) {} );
			}

			return res.json( output );
		} else {
			var output = {
				status: msg.status,
				message: msg.message
			};
			return res.json( output );
		}
	} )
} );

app.post( '/issue/:item/:user', auth.isLoggedIn, function( req, res ) {
	var opts = {
		lookup: [ 'group' ]
	}
	Users.getByBarcode( req.params.user, function( msg, user ) {
		if ( user ) {
			if ( user.disable ) {
				res.json( {
					status: 'danger',
					message: 'User account been disabled',
					barcode: user.barcode
				} );
			} else {
				Items.getByBarcode( req.params.item, opts, function( msg, item ) {
					if ( item ) {
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
								function issue( item, user, operator ) {
									Items.issue( item.barcode, user.id, function( msg ) {
										Actions.log( {
											item_id: item.id,
											datetime: new Date(),
											action: 'issued',
											operator_id: operator.id,
											user_id: user.id
										}, function( err ) {} );

										var output = {
											status: msg.status,
											message: msg.message
										};

										return res.json( output );
									} )
								}

								if ( item.group_id && item.group_limiter ) {
									Items.countItemsByGroupOnLoanToUserById( user.id, item.group_id, function( err, count ) {
										if ( count >= item.group_limiter && ! req.query.override ) {
											return res.json( {
												status: 'danger',
												message: 'User already has ' + count + ' of this type of item out',
												override: true,
												barcode: item.barcode
											} );
										} else {
											issue( item, user, req.user );
										}
									} );
								} else {
									issue( item, user, req.user );
								}
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
				} )
			}
		} else {
			return res.json( {
				status: 'danger',
				message: 'Unknown user',
				barcode: req.params.user
			} );
		}
	} )
} );

app.post( '/label/:item', auth.isLoggedIn, function( req, res ) {
	Items.getByBarcode( req.params.item, function( err, item ) {
		if ( item ) {
			if ( req.user.printer_id ) {
				Print.label( {
					barcode: item.barcode,
					text: item.name,
					type: item.label
				}, req.user.printer_url );
				return res.json( {
					status: 'success',
					message: 'Label printed to ' + req.user.printer_name,
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

	Courses.getById( req.body.course, function( err, course ) {
		if ( ! course ) {
			return res.json( {
				status: 'danger',
				message: 'The user must be assigned to a course'
			} );
		}
		Years.getById( req.body.year, function( err, year ) {
			 if ( ! year ) {
				return res.json( {
					status: 'danger',
					message: 'The user must be assigned to a year'
				} );
			}

			var user = {
				name: req.body.name,
				type: 'student',
				barcode: req.body.barcode,
				email: req.body.email,
				course_id: course.id,
				year_id: year.id
			}

			Users.create( user, function ( err, result ) {
				if ( ! err ) {
					return res.json( {
						status: 'success',
						message: 'User created',
						redirect: {
							type: 'user',
							barcode: req.body.barcode
						}
					} );
				} else {
					return res.json( {
						status: 'danger',
						message: err.message,
						redirect: {
							type: 'user',
							barcode: req.body.barcode
						}
					} );
				}
			} );
		} );
	} );
} );

app.get( '/history', auth.isLoggedIn, function( req, res ) {
	Actions.getDateRange( moment().startOf( 'day' ), moment().endOf( 'day' ), function( err, actions ) {
		var html = pug.renderFile( __views + '/modules/history.pug', {
			actions: actions,
			moment: moment
		} ) ;
		res.json( {
			actions: html
		} );
	} );
} );

module.exports = function( config ) { return app; };
