var ItemBarcodeRegEx = /([A-Z]{2,4})  ?([0-9]{2})/;
 
jQuery( document ).ready( function() {
	jQuery( '#cmd input' ).focus();
	jQuery( '#cmd' ).submit( function( e ) {
		e.preventDefault();

		var cmd = jQuery( '#cmd input[type=text]' ).val().toUpperCase();

		if ( cmd.substring( 0, 4 ) == '1234' && cmd.length == 12 ) {
			socket.emit( 'user', cmd );
		} else if ( ItemBarcodeRegEx.exec( cmd ) != null ) {
			var val = ItemBarcodeRegEx.exec( cmd );
			var item = val[1] + ' ' + val[2];
			socket.emit( 'item', item );
		} else if ( cmd == 'LOGOUT' ) {
			window.location = '/logout';
		}

		jQuery( '#cmd input[type=text]' ).val('');
	} );
} );

socket.on( 'item', function( item ) {
	var modal = jQuery( item );
	jQuery( modal ).on( 'hidden.bs.modal', function() {
		jQuery( this ).remove();
	});
	jQuery( 'body' ).append( modal );
	jQuery( modal ).modal();
	setTimeout( function() { jQuery( '#checkout .user' ).focus(); }, 250 );

	jQuery( '#checkout' ).submit( function ( e ) {
		var cmd = jQuery( '#checkout .user' ).val().toUpperCase();
		var item = jQuery( '#item' ).val().toUpperCase();
		if ( cmd == 'BROKEN' ) {
			socket.emit( 'broken', { itemId: item } );
			e.preventDefault();
		} else if ( cmd == 'AUDIT' ) {
			socket.emit( 'audit', { itemId: item } );
			e.preventDefault();
		} else if ( cmd == 'RETURN' ) {
			socket.emit( 'return', { itemId: item } );
			e.preventDefault();
		} else {
			socket.emit( 'issue', { userBarcode: jQuery( '#checkout .user' ).val(), itemId: item } );
			e.preventDefault();
		}
	} );

	jQuery( '#reserve' ).submit( function ( e ) {
		e.preventDefault();
		var user = jQuery( '#reserve .user' ).val();
		var item = jQuery( '#item' ).val().toUpperCase();
		console.log( user );
		socket.emit( 'reserve', { user: user, item: item } );
	} );

	setTimeout( function() {
		jQuery( '#modal' ).modal( 'hide' )
	}, 10000 );
} );

socket.on( 'user', function( user ) {
	var modal = jQuery( user );
	jQuery( modal ).on( 'hidden.bs.modal', function() {
		jQuery( this ).remove();
	});
	jQuery( 'body' ).append( modal );
	jQuery( modal ).modal();
	setTimeout( function() {
		jQuery( '#modal' ).modal( 'hide' )
	}, 10000 );
} );

socket.on( 'create', function( url ) {
	window.location = url;
} );

socket.on( 'flash', function( msg ) {
	var flash = jQuery( '<div class="alert alert-' + msg.type + '"><strong>' + msg.barcode + '</strong>: ' + msg.message + '</div>' );
	jQuery( flash ).insertAfter( 'h2' );
	jQuery( '#modal' ).modal( 'hide' );
	jQuery( '#cmd input' ).focus();
	setTimeout( function() {
		jQuery( flash ).fadeOut( function() {
			jQuery( this ).remove();
		} );
	}, 5000 );
} )