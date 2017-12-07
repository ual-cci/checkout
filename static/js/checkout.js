var typeTimeout;
var flashTimeout;
var one_item;

var current = {};

jQuery( document ).ready( function() {
	defaultFlash();

	focus();

	jQuery( '#find' ).bind( 'submit', handleIssueSubmit );
	jQuery( '#return' ).bind( 'submit', handleReturnSubmit );

	jQuery( document ).bind( 'keyup', handleKeyPress );

	jQuery( '#find input' ).bind( 'input', function( e ) {
		if ( jQuery( '#find input' ).val() == '' ) empty();
		clearTimeout( typeTimeout );
		typeTimeout = setTimeout( searchTimer, 100 );
	} );

	jQuery( document ).delegate( '#modules .panel-title', 'click', function() {
		var clicked = jQuery( this ).closest( '.panel' );
		select( clicked.data( 'type' ), clicked.data( 'barcode' ) );
	} );

	jQuery( '#mode li a' ).on( 'shown.bs.tab', function( a ) {
		focus();
	} );

	jQuery( document ).delegate( '#modules .buttons button', 'click', function() {
		var clicked = jQuery( this ).closest( '.panel' );
		var type = jQuery( clicked ).data( 'type' );
		var barcode = jQuery( clicked ).data( 'barcode' );

		switch ( jQuery( this ).html() ) {
			case 'Return':
				returnItem( barcode, function( data ) {
					flash( data.status, data.message );
					select( 'item', data.barcode );
				} );
				break;
			case 'Broken':
				broken( barcode, function( data ) {
					flash( data.status, data.message );
					select( 'item', data.barcode );
				} );
				break;
			case 'Lost':
				lost( barcode, function( data ) {
					flash( data.status, data.message );
					select( 'item', data.barcode );
				} );
				break;
		}
	} );

	jQuery( document ).delegate( '#results .list-group-item', 'click', function() {
		var type = jQuery( this ).data( 'type' );
		var barcode = jQuery( this ).data( 'barcode' );
		select( type, barcode );
		defaultFlash();
		empty( true );
	} );
} );

function searchTimer() {
	search( jQuery( '#find input' ).val(), function( data ) {
		empty();

		var last_item;

		// Process items
		if ( data.items.length > 0 ) {
			for ( i in data.items ) {
				last_item = data.items[i];
				last_item.type = 'item';
				addResult( data.items[i], 'item' );
			}
			jQuery( '.items a' ).tab( 'show' );
		}

		// Process users
		if ( data.users.length > 0 ) {
			for ( i in data.users ) {
				last_item = data.users[i];
				last_item.type = 'user';
				addResult( data.users[i], 'user' );
			}
			if ( current.type != 'user' ) jQuery( '.users a' ).tab( 'show' );
		}

		if ( data.users.length + data.items.length == 1 ) one_item = last_item;
	} );
}

function updateCurrent() {
	select( current.type, current.barcode );
}

function select( type, barcode ) {
	switch ( type ) {
		case 'user':
			getUser( barcode, function( data ) {
				if ( data.html ) {
					addModule( data );
				} else {
					flash( data.status, data.message );
				}
			} );
			break;
		case 'item':
			if ( current.type == 'user' ) {
				issue( barcode, current.barcode, function( data ) {
					if ( data.status ) flash( data.status, data.message );
					updateCurrent();
				} );
			} else {
				getItem( barcode, function( data ) {
					if ( data.html ) {
						addModule( data );
					}
				} );
			}
			break;
	}
}

function defaultFlash() {
	// flash( 'info', 'Scan an item or user.', true );
	clearFlash();
}

function clearFlash() {
	clearTimeout( flashTimeout );
	jQuery( '#flash' ).empty();
}

function flash( status, message, noTimeout ) {
	clearFlash();
	if ( ! noTimeout ) setTimeout( function() { defaultFlash(); }, 5000 );
	var alert = jQuery( '<div class="alert">' + message + '</div>' ).addClass( 'alert-' + status );
	jQuery( '#flash' ).append( alert );
}

function addModule( data ) {
	clearActive();
	current = data;
	jQuery( '#modules [data-barcode="' + data.barcode + '"]' ).remove();
	if ( data.type == 'user' ) {
		jQuery( '.find' ).addClass( 'panel-primary' ).removeClass( 'panel-default' );
		jQuery( '#results .items a' ).tab( 'show' );
	}
	jQuery( '#modules' ).prepend( data.html );
}
function addResult( result, type ) {
	var html = '<li class="list-group-item" data-type="' + type + '" data-barcode="' + result.barcode + '"><small>';
	switch ( result.status ) {
		case 'available':
			html += ' <span class="label label-success">&nbsp;</span>';
			break;
		case 'on-loan':
			html += ' <span class="label label-danger">&nbsp;</span>';
			break;
		case 'lost':
		case 'broken':
			html += ' <span class="label label-warning">&nbsp;</span>';
			break;
		case undefined:
			break;
		default:
			html += ' <span class="label label-default">&nbsp;</span>';
			break;
	}
	html += ' <strong>' + result.name + '</strong>';
	html += '<br />';
	html += result.barcode;
	html += '</small></li>';
	jQuery( '#results #' + type + 's .list-group' ).append( html )
}

function issue( item, user, cb ) {
	jQuery.post( '/api/issue/' + item + '/' + user, function( data, status ) {
		cb( data );
	} );
}
function returnItem( item, cb ) {
	jQuery.post( '/api/return/' + item, function( data, status ) {
		cb( data );
	} );
}
function broken( item, cb ) {
	jQuery.post( '/api/broken/' + item, function( data, status ) {
		cb( data );
	} );
}
function lost( item, cb ) {
	jQuery.post( '/api/lost/' + item, function( data, status ) {
		cb( data );
	} );
}
function search( barcode, cb ) { apiGET( 'search', barcode, cb ); }
function getItem( barcode, cb ) { apiGET( 'item', barcode, cb ); }
function getUser( barcode, cb ) { apiGET( 'user', barcode, cb ); }
function identify( barcode, cb ) { apiGET( 'identify', barcode, cb ); }
function apiGET( method, barcode, cb ) {
	jQuery.get( '/api/' + method + '/' + barcode, function( data, status ) {
		cb( data );
	} );
}

function empty( clear ) {
	one_item = null;
	jQuery( '#results #users ul' ).empty();
	jQuery( '#results #items ul' ).empty();
	if ( clear ) jQuery( '#find input' ).val('');
}
function clearActive() {
	empty( true );
	current = {};
	jQuery( '.find' ).addClass( 'panel-default' ).removeClass( 'panel-primary' );
	jQuery( '#results .users a' ).tab( 'show' );
	jQuery( '#modules .panel-primary' ).addClass( 'panel-default' ).removeClass( 'panel-primary' );
}

function handleKeyPress( e ) {
	switch( e.keyCode ) {
		case 27: // Escape
			clearActive();
			defaultFlash();
			focus();
			break;
		case 124: // F13
			jQuery( '.issue a' ).tab( 'show' );
			break;
		case 125: // F14
			jQuery( '.return a' ).tab( 'show' );
			break;
		case 126: // F15
			focus();
			break;
		default:
			// console.log( String.fromCharCode( e.keyCode ) );
			// console.log( e.keyCode );
			// console.log( e.key );
			// console.log( e );
			break;
	}
}

function handleIssueSubmit( e ) {
	e.preventDefault();
	clearTimeout( typeTimeout );

	if ( one_item ) {
		select( one_item.type, one_item.barcode );
		one_item = null;
		return;
	}
	var term = jQuery( '#find input' ).val();

	identify( term, function( data ) {
		if ( data.kind == 'unknown' ) {
			flash( 'warning', 'Unknown barcode.' )
		} else {
			select( data.kind, data.barcode );
			defaultFlash();
			empty( true );
		}
	} );
}

function status( status, message, barcode ) {
	var html = '<div class="alert">';
	if ( barcode ) html += '<strong>' + barcode + '</strong>: ';
	html += message;
	html += '</div>';
	var alert = jQuery( html ).addClass( 'alert-' + status );
	jQuery( '#status' ).append( alert );
	setTimeout( function() { jQuery( alert ).fadeOut() }, 5000 );
}

function handleReturnSubmit( e ) {
	e.preventDefault();

	var term = jQuery( '#return input' ).val();
	jQuery( '#return input' ).val('');

	returnItem( term, function( data ) {
		if ( data ) {
			status( data.status, data.message, data.barcode );
		} else {
			status( 'danger', 'Unknown item' );
		}
	} )
}

function focus() {
	switch( jQuery( '#mode li.active a' ).attr( 'href' ).substr( 1 ) ) {
		case 'return':
			jQuery( '#return input' ).focus();
			break;
		case 'issue':
			jQuery( '#find input' ).focus();
			break;
	}
}
