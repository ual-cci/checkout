var errorSound = new buzz.sound( "/sounds/error.wav" );
var successSound = new buzz.sound( "/sounds/success.wav" );

jQuery( document ).ready( function() {
	jQuery( '#barcode' ).focus();

	jQuery( 'form' ).submit( function( e ) {
		socket.emit( 'audit', { itemBarcode: jQuery( '#barcode' ).val().toUpperCase() } );
		jQuery( '#barcode' ).val( '' ).focus();
		e.preventDefault();
	} );
} );

socket.on( 'flash', function( msg ) {
	if ( msg.type == 'success' ) successSound.play();
	if ( msg.type == 'danger' ) errorSound.play();
	var flash = jQuery( '<div class="alert alert-' + msg.type + '"><strong>' + msg.barcode + '</strong>: ' + msg.message + '</div>' );
	jQuery( flash ).insertAfter( 'h2' );
	setTimeout( function() {
		jQuery( flash ).fadeOut( function() {
			jQuery( this ).remove();
		} );
	}, 5000 );
} )