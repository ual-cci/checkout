var sio = require( 'socket.io' );

var swig = require( 'swig' );

var Items = require( __dirname + '/../models/items' ),
	Users = require( __dirname + '/../models/users' ),
	ObjectId = require( 'mongoose' ).Schema.Types.ObjectId;

module.exports = function( server ) {
	var io = sio.listen( server );

	io.on( 'connection', function( socket ) {
		socket.on( 'user', function( barcode ) {
			if ( barcode.substring( 0, 4 ) == '1234' && barcode.length == 12 ) {
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
							var buttons = [];

							socket.emit( 'mode', {
								mode: 'item',
								buttons: [ 'user-issue' ],
								data: {
									user: user.barcode,
								}
							} );
							socket.emit( 'module', swig.renderFile( __dirname + '/../views/checkout/modules/user.swig', { user: user, onloan: onloan } ) );
						} );
					} else {
						socket.emit( 'create', '/users/create?barcode=' + barcode );
					};
				} );
			}
		} );
		socket.on( 'item', function( barcode ) {
			if ( /([A-Z]{2,4}) ([0-9]{2})/.exec( barcode ) != null ) {
				Items.findOne( { barcode: barcode } ).populate( 'department' ).populate( 'group' ).exec( function( err, item ) {
					if ( item == null ) return;
					var buttons = [];

					switch ( item.status ) {
						case 'on-loan':
						case 'broken':
						case 'lost':
							buttons = [ 'return' ];
							break;
						case 'available':
							buttons = [ 'item-issue', 'reserve', 'broken', 'lost' ];
							break;
					}

					socket.emit( 'mode', {
						mode: 'user',
						buttons: buttons,
						data: {
							item: item.barcode,
						}
					} );

					socket.emit( 'module', swig.renderFile( __dirname + '/../views/checkout/modules/item.swig', { item: item } ) );
				} );
			}
		} );
	} );

	return io;
};
