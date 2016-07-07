var ItemBarcodeRegEx = /([A-Z]{2,4})  ?([0-9]{2})/;
var PartialItemBarcodeRegEx = /([A-Z]{2,4}) /;

var mode = 'find';
var data = {};

jQuery( document ).ready( function() {
	jQuery( '#find input' ).focus();

	jQuery( 'input' ).bind( 'blur', function( e ) {
		if ( e.relatedTarget == undefined || e.relatedTarget.tagName != 'INPUT' )
			jQuery( '#find input' ).focus();
	} );

	jQuery( '#find input' ).bind( 'keyup', function( e ) {
		if ( e.keyCode == 27 ) {
			modeUpdate( 'find' );
			jQuery( '#modules .panel-primary' ).removeClass( 'panel-primary' ).addClass( 'panel-info' );
			jQuery('#find .btn').hide();
			jQuery( '#find input' ).val( '' );
		}
	} );

	jQuery( '#find input' ).bind( 'input', function( e ) {
		var find = jQuery( '#find input' ).val().toUpperCase();

		if ( mode.indexOf( 'item' ) != -1 ) {
			if ( PartialItemBarcodeRegEx.exec( find ) != null ) {
				modeUpdate( 'item' );
				jQuery( '#modules .panel-primary' ).removeClass( 'panel-primary' ).addClass( 'panel-info' );
				jQuery( '#find .btn' ).hide();
			}
		} else if ( mode.indexOf( 'user' ) != -1 ) {
			if ( find.substring( 0, 4 ) == '1234' ) {
				modeUpdate( 'user' );
				jQuery( '#modules .panel-primary' ).removeClass( 'panel-primary' ).addClass( 'panel-info' );
				jQuery( '#find .btn' ).hide();
			}
		} else if ( mode.indexOf( 'selected' ) == -1 ) {
			if ( find.substring( 0, 4 ) == '1234' ) {
				modeUpdate( 'user' );
			} else if ( ItemBarcodeRegEx.exec( find ) != null ) {
				modeUpdate( 'item' );
			} else {
				modeUpdate( 'find' );
			}
		}
	} );

	jQuery( '#find .btn' ).bind( 'click', function( e ) {
		e.preventDefault();
		var action = jQuery( this ).data( 'action' );
		jQuery( '#find .btn' ).removeClass( 'btn-primary' );
		jQuery( '#find .btn' ).addClass( 'btn-default' );
		jQuery( '#find .btn[data-action=' + action + ']' ).addClass( 'btn-primary' );
	} );

	jQuery( '#find' ).bind( 'submit', function( e ) {
		e.preventDefault();
		console.log( mode );
		switch ( mode ) {
			case 'item':
				var item = jQuery( '#find input' ).val().toUpperCase();
				item = ItemBarcodeRegEx.exec( item );
				item = item[1] + ' ' + item[2];
				jQuery( '#find input' ).val( item );
			case 'user':
				socket.emit( mode, jQuery( '#find input' ).val() );
				break;
			case 'item-selected':
				var action = jQuery( '#find .btn:visible.btn-primary' ).data( 'action' );
				socket.emit( action, {
					user: jQuery( '#find input' ).val().toUpperCase(),
					item: data.item,
					mode: 'item'
				} );
				break;
			case 'user-selected':
				var item = jQuery( '#find input' ).val().toUpperCase();
				item = ItemBarcodeRegEx.exec( item );
				item = item[1] + ' ' + item[2];
				jQuery( '#find input' ).val( item );
				socket.emit( 'issue', {
					user: data.user,
					item: jQuery( '#find input' ).val(),
					mode: 'user'
				} );
				break;
		}
		jQuery( '#find input' ).val( '' );
		modeUpdate( 'find' );
	} );

	jQuery( document ).on( 'submit', '#modules form', function ( e ) {
		e.preventDefault()
		var user = {
			name: jQuery( this ).find( '[name=name]' ).val(),
			email: jQuery( this ).find( '[name=email]' ).val(),
			course: jQuery( this ).find( '[name=course]' ).val(),
			barcode: jQuery( this ).parents( '.panel' ).data( 'id' )
		}
		socket.emit( 'new-user', user );
	} );
} );

socket.on( 'mode', function( m ) {
	modeUpdate( m.mode );
	data = m.data;
	if ( m.mode == 'find' ) {
		clear();
	}
	if ( m.buttons ) {
		jQuery( '#find .btn' ).hide();
		jQuery( '#find .btn' ).removeClass( 'btn-primary' ).addClass( 'btn-default' );
		for ( b in m.buttons ) {
			var button = m.buttons[b];
			jQuery( '#find .' + button ).show();
			if ( b == 0 ) jQuery( '#find .' + button ).removeClass( 'btn-default' ).addClass( 'btn-primary' );
		}
	}
} )

socket.on( 'module', function( html ) {
	var module = jQuery( html );
	// Remove duplicates
	jQuery( '#modules [data-id="' +  jQuery( module ).data( 'id' ) + '"]' ).remove();

	// Clear primary class
	jQuery( '#modules .panel-primary' ).removeClass( 'panel-primary' ).addClass( 'panel-info' );

	// Add new module
	jQuery( '#modules' ).prepend( module );

	// Trim surplus
	jQuery( jQuery( '#modules .panel' ).splice( 5 ) ).remove();
} )

socket.on( 'flash', function( msg ) {
	var flash = jQuery( '<div class="alert alert-' + msg.type + '"><strong>' + msg.barcode + '</strong>: ' + msg.message + '</div>' );
	jQuery( flash ).insertBefore( '#modules' );
	setTimeout( function() {
		jQuery( flash ).fadeOut( function() {
			jQuery( this ).remove();
		} );
	}, 5000 );
} )

function modeUpdate( m ) {
	mode = m;

	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-search' );
	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-barcode' );
	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-user' );

	if ( mode == 'user' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-user' );
	} else if ( mode == 'user-selected' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-barcode' );
	} else if ( mode == 'item' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-barcode' );
	} else if ( mode == 'item-selected' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-user' );
	} else {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-search' );
	}
}
