var ItemBarcodeRegEx = /([A-Z]{2,4})  ?([0-9]{2})/;

var mode = 'find'; // find, user, item
var data = {};

jQuery( document ).ready( function() {
	jQuery( '#find input' ).focus();

	jQuery( 'input' ).bind( 'blur', function( e ) {
		if ( e.relatedTarget == undefined || e.relatedTarget.tagName != 'INPUT' )
			jQuery( '#find input' ).focus();
	} );

	jQuery( '#find input' ).bind( 'input', function( e ) {
		var find = jQuery( '#find input' ).val().toUpperCase();
		jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-search' );
		jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-barcode' );
		jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-user' );
		if ( find.substring( 0, 4 ) == '1234' ) {
			modeUpdate( 'user' );
		} else if ( ItemBarcodeRegEx.exec( find ) != null ) {
			modeUpdate( 'item' );
		} else {
			modeUpdate( 'find' );
		}
	} );

	jQuery( '#find .btn-group .btn' ).bind( 'click', function( e ) {
		e.preventDefault();
		var action = jQuery( this ).data( 'action' );
		jQuery( '#find .btn-group .btn' ).removeClass( 'btn-primary' );
		jQuery( '#find .btn-group .btn' ).addClass( 'btn-default' );
		jQuery( '#find .btn-group .btn[data-action=' + action + ']' ).addClass( 'btn-primary' );
	} );

	jQuery( '#find' ).bind( 'submit', function( e ) {
		e.preventDefault();
		switch ( mode ) {
			case 'user':
			case 'item':
				socket.emit( mode, jQuery( '#find input' ).val().toUpperCase() );
				jQuery( '#find input' ).val( '' );
				break;
			default:
				flash( 'warning', 'Invalid Entry' )
				jQuery( '#find input' ).val( '' );
		}
		modeUpdate( 'find' );
	} );
} );

socket.on( 'mode', function( m ) {
	modeUpdate( m.mode );
	data = m.data;
	if ( m.buttons ) {
		jQuery('#find .btn').hide();
		for ( b in m.buttons ) {
			var button = m.buttons[b];
			jQuery( '#find .' + button ).show();
		}
	}
} )

socket.on( 'module', function( html ) {
	var module = jQuery( html );
	jQuery( '#modules .panel-primary' ).removeClass( 'panel-primary' ).addClass( 'panel-info' );
	jQuery( '#modules' ).prepend( module );
	jQuery( jQuery( '#modules .panel' ).splice( 5 ) ).remove();
} )

function modeUpdate( m ) {
	mode = m;

	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-search' );
	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-barcode' );
	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-user' );

	if ( mode == 'user' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-user' );
	} else if ( mode == 'item' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-barcode' );
	} else {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-search' );
	}
}
