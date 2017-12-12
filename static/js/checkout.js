var errorSound = new buzz.sound( "/sounds/error.wav" );
var successSound = new buzz.sound( "/sounds/success.wav" );

var typeTimeout;
var flashTimeout;
var one_item;

var current = {};

jQuery( document ).ready( function() {
	focus();
	jQuery( '#find input' ).bind( 'input', handleSearchInput );
	jQuery( document ).bind( 'keyup', handleKeyPress );
	jQuery( '#find' ).bind( 'submit', handleIssueSubmit );
	jQuery( '#return' ).bind( 'submit', handleReturnSubmit );
	jQuery( '#audit' ).bind( 'submit', handleAuditSubmit );
	jQuery( '#label' ).bind( 'submit', handleLabelSubmit );
	jQuery( document ).delegate( '#modules .panel-title', 'click', handlePanelClick );
	jQuery( document ).delegate( '#modules .buttons button', 'click', handleItemButtons );
	jQuery( document ).delegate( '#modules .glyphicon-print', 'click', handlePrintButton );
	jQuery( document ).delegate( '#results .list-group-item', 'click', handleResultClick );
	jQuery( '#mode li a' ).on( 'shown.bs.tab', function( a ) { focus(); } );
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
					flash( data );
				}
			} );
			break;
		case 'item':
			if ( current.type == 'user' ) {
				issue( barcode, current.barcode, function( data ) {
					if ( data.status ) flash( data );
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

function flash( data, noTimeout ) {
	var activeTab = '#' + jQuery( '#mode li.active a' ).attr( 'href' ).substr( 1 ) + ' .flash';

	jQuery( activeTab ).children().slice( 10 ).remove();

	var html = '<div class="alert">';
		if ( data.barcode ) html += '<strong>' + data.barcode + '</strong>: ';
		html += data.message;
	html += '</div>';
	var alert = jQuery( html ).addClass( 'alert-' + data.status );

	jQuery( activeTab ).prepend( alert );
	setTimeout( function() { jQuery( alert ).remove() }, 5000 );
}

function addModule( data ) {
	clearActive();

	// Trim the list
	jQuery( '#modules' ).children().slice( 10 ).remove();

	// Remove exi
	jQuery( '#modules [data-barcode="' + data.barcode + '"]' ).remove();

	if ( data.type == 'user' ) {
		current = data;
		jQuery( '.find' ).addClass( 'panel-primary' ).removeClass( 'panel-default' );
		jQuery( '#results .items a' ).tab( 'show' );
	} else {
		current = null;
	}

	var module = jQuery( data.html );
	jQuery( '#modules' ).prepend( module );
	setTimeout( function() { jQuery( module ).remove(); }, 60000 );

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
	if ( result.disable ) html = jQuery( html ).addClass( 'disabled' );
	jQuery( '#results #' + type + 's .list-group' ).append( html );
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
function label( item, cb ) {
	jQuery.post( '/api/label/' + item, function( data, status ) {
		cb( data );
	} );
}
function audit( item, department, cb ) {
	jQuery.post( '/api/audit/' + item, { department: department }, function( data, status ) {
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
			focus();
			break;
		case 124: // F13
			jQuery( '.issue a' ).tab( 'show' );
			break;
		case 125: // F14
			jQuery( '.return a' ).tab( 'show' );
			break;
		case 126: // F15
			jQuery( '.print a' ).tab( 'show' );
			break;
		case 127: // F16
			jQuery( '.audit a' ).tab( 'show' );
			break;
		default:
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
			flash( { status: 'warning', message: 'Unknown barcode', barcode: term } );
		} else {
			select( data.kind, data.barcode );
			empty( true );
		}
	} );
}

function handleReturnSubmit( e ) {
	e.preventDefault();

	var term = jQuery( '#return input' ).val();
	jQuery( '#return input' ).val('');

	returnItem( term, function( data ) {
		if ( data ) {
			flash( data );
		} else {
			flash( { status: 'danger', message: 'Unknown item', barcode: term } );
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
		case 'audit':
			jQuery( '#audit input' ).focus();
			break;
		case 'label':
			jQuery( '#label input' ).focus();
			break;
	}
}

function handleItemButtons() {
	var clicked = jQuery( this ).closest( '.panel' );
	var type = jQuery( clicked ).data( 'type' );
	var barcode = jQuery( clicked ).data( 'barcode' );

	switch ( jQuery( this ).html() ) {
		case 'Return':
			returnItem( barcode, function( data ) {
				flash( data );
				select( 'item', data.barcode );
			} );
			break;
		case 'Broken':
			broken( barcode, function( data ) {
				flash( data );
				select( 'item', data.barcode );
			} );
			break;
		case 'Lost':
			lost( barcode, function( data ) {
				flash( data );
				select( 'item', data.barcode );
			} );
			break;
	}
}

function handlePrintButton() {
	var clicked = jQuery( this ).closest( '.panel' );
	var type = jQuery( clicked ).data( 'type' );
	var barcode = jQuery( clicked ).data( 'barcode' );

	label( barcode, function ( data ) {
		flash( data );
	} );
}

function handleResultClick() {
	var type = jQuery( this ).data( 'type' );
	var barcode = jQuery( this ).data( 'barcode' );
	if ( jQuery( this ).hasClass( 'disabled' ) ) return flash( { status: 'warning', message: 'Cannot select a disabled user account' } );
	select( type, barcode );
	empty( true );
}

function handlePanelClick() {
	var clicked = jQuery( this ).closest( '.panel' );
	select( clicked.data( 'type' ), clicked.data( 'barcode' ) );
}

function handleSearchInput( e ) {
	if ( jQuery( '#find input' ).val() == '' ) empty();
	clearTimeout( typeTimeout );
	typeTimeout = setTimeout( searchTimer, 100 );
}

function handleAuditSubmit( e ) {
	e.preventDefault();

	var term = jQuery( '#audit input' ).val();
	jQuery( '#audit input' ).val('');

	audit( term, jQuery( '#department' ).val(), function( data ) {
		if ( data.status == 'success' ) successSound.play();
		if ( data.status == 'danger' ) errorSound.play();
		flash( data );
	} );
}

function handleLabelSubmit( e ) {
	e.preventDefault();

	var term = jQuery( '#label input' ).val();
	jQuery( '#label input' ).val('');

	label( term, function( data ) {
		flash( data );
	} );
}
