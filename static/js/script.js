var socket = io();

jQuery( document ).ready( function() {
	var clipboard = new Clipboard( '.clipboard' );
	clipboard.on( 'success', function( e ) {
		console.log( e );
	} );
	clipboard.on( 'error', function( e ) {
		console.log( e );
	} );

	jQuery( 'input[type=checkbox].checkall' ).bind( 'click', function( ) {
		if( jQuery( this ).prop( 'checked' ) ) {
			jQuery( 'input[type=checkbox]' ).prop( 'checked', true );
		} else {
			jQuery( 'input[type=checkbox]' ).prop( 'checked', false );
		}
	} )
} );
