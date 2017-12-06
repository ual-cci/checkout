var errorSound = new buzz.sound( "/sounds/error.wav" );
var successSound = new buzz.sound( "/sounds/success.wav" );

jQuery( document ).ready( function() {
	jQuery( '#barcode' ).focus();

	jQuery( '#barcode' ).bind( 'input', function( e ) {
		jQuery( '#barcode' ).val( jQuery( '#barcode' ).val().toUpperCase() );
	} );

	jQuery( 'form' ).submit( function( e ) {
		e.preventDefault();
		audit( jQuery( '#barcode' ).val(), jQuery('#department').val(), function( res ) {
			flash( res.status, res.message, res.barcode );
			jQuery( '#barcode' ).val( '' ).focus();
		} );
	} );
} );

function audit( item, department, cb ) {
	jQuery.post( '/api/audit/' + item, { department: department }, function( data, status ) {
		cb( data );
	} );
}

function flash( type, message, barcode ) {
	if ( type == 'success' ) successSound.play();
	if ( type == 'danger' ) errorSound.play();
	var flash = jQuery( '<div class="alert alert-' + type + '"><strong>' + barcode + '</strong>: ' + message + '</div>' );
	jQuery( flash ).insertAfter( 'h2' );
	setTimeout( function() {
		jQuery( flash ).fadeOut( function() {
			jQuery( this ).remove();
		} );
	}, 5000 );
}
