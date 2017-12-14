jQuery( document ).ready( function() {
	var clipboard = new Clipboard( '.clipboard' );
	clipboard.on( 'success', function( e ) {
		console.log( e );
	} );
	clipboard.on( 'error', function( e ) {
		console.log( e );
	} );

	jQuery( 'input[type=checkbox].checkall' ).bind( 'click', function( ) {
		if ( jQuery( '.tab-pane' ).length > 0 ) {
			if ( jQuery( this ).prop( 'checked' ) ) {
				jQuery( '.tab-pane.active .table input[type=checkbox]' ).prop( 'checked', true );
			} else {
				jQuery( '.tab-pane.active .table input[type=checkbox]' ).prop( 'checked', false );
			}
		} else {
			if ( jQuery( this ).prop( 'checked' ) ) {
				jQuery( '.table input[type=checkbox]' ).prop( 'checked', true );
			} else {
				jQuery( '.table input[type=checkbox]' ).prop( 'checked', false );
			}
		}
	} )
} );
