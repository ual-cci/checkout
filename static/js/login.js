// Connect socket.io
var io = io();

jQuery( document ).ready( function() {
	$( '#id' ).focus();

	$( '#login' ).submit( function( e ) {
		e.preventDefault();
		if ( $( '#id' ).val() != '' ) io.emit( 'login', $( '#id' ).val() );
	} );
} );
