var ItemBarcodeRegEx = /([A-Z]{2,4})  ?([0-9]{2})/;
var PartialItemBarcodeRegEx = /([A-Z]{2,4}) /;
var mode = 'find';
var data = {};
var cancelTimeout;
var statusTimeout;

jQuery( document ).ready( function() {
	socket.emit( 'update-stats' );
	jQuery( '#find input' ).focus();

	jQuery( 'input' ).bind( 'blur', function( e ) {
		if ( e.relatedTarget == undefined || e.relatedTarget.tagName != 'INPUT' )
			jQuery( '#find input' ).focus();
	} );

	jQuery( '#find input' ).bind( 'keyup', function( e ) {
		if ( e.keyCode == 27 ) {
			cancel();
			clearFlash();
		} else {
			resetCancelTimeout();
		}
	} );

	jQuery( '#find input' ).bind( 'input', function( e ) {
		jQuery( '#find input' ).val(  jQuery( '#find input' ).val().toUpperCase() );
		var find = jQuery( '#find input' ).val();
		if ( mode.indexOf( 'selected' ) == -1 && mode != 'multi-return' )
			if ( find.length >= 7 ) {
				socket.emit( 'identify', find );
			} else {
				modeUpdate( 'find' );
			}
	} );

	jQuery( '#find .btn' ).bind( 'click', function( e ) {
		e.preventDefault();
		resetCancelTimeout();
		var action = jQuery( this ).data( 'action' );
		if ( action == 'multi-return' ) modeUpdate( action );
		jQuery( '#find .btn' ).removeClass( 'btn-primary' );
		jQuery( '#find .btn' ).addClass( 'btn-default' );
		jQuery( '#find .btn[data-action=' + action + ']' ).addClass( 'btn-primary' );
	} );

	jQuery( '#find' ).bind( 'submit', function( e ) {
		e.preventDefault();
		switch ( mode ) {
			case 'item':
				var item = jQuery( '#find input' ).val();
				item = ItemBarcodeRegEx.exec( item );
				item = item[1] + ' ' + item[2];
				jQuery( '#find input' ).val( item );
			case 'user':
				socket.emit( mode, jQuery( '#find input' ).val() );
				break;
			case 'item-selected':
				var action = jQuery( '#find .btn:visible.btn-primary' ).data( 'action' );
				socket.emit( action, {
					user: jQuery( '#find input' ).val(),
					item: data.item,
					mode: 'item'
				} );
				break;
			case 'user-selected':
				var item = jQuery( '#find input' ).val();
				item = ItemBarcodeRegEx.exec( item );
				item = item[1] + ' ' + item[2];
				jQuery( '#find input' ).val( item );
				socket.emit( 'issue', {
					user: data.user,
					item: jQuery( '#find input' ).val(),
					mode: 'user'
				} );
				break;
			case 'multi-return':
				var item = jQuery( '#find input' ).val();
				item = ItemBarcodeRegEx.exec( item );
				item = item[1] + ' ' + item[2];
				socket.emit( 'return', {
					item: jQuery( '#find input' ).val(),
					mode: 'multi-return'
				} );
				break;
		}
		jQuery( '#find input' ).val( '' );

		if ( mode != 'multi-return' )
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

	jQuery( '.container' ).on( 'click', '.override', function( e ) {
		clearFlash();
		socket.emit( 'issue', {
			user: data.user,
			item: data.item,
			mode: mode.split('-')[0],
			override: true
		} );
	} );

	jQuery( '.container' ).on( 'click', '.read_tc', function( e ) {
		clearFlash();
		socket.emit( 'issue', {
			user: data.user,
			item: data.item,
			mode: mode.split('-')[0],
			override: true
		} );
		socket.emit( 'read_tc', {
			user: data.user
		} );
	} );
} );

socket.on( 'mode', function( m ) {
	resetCancelTimeout();
	modeUpdate( m.mode );
	data = m.data;

	switch ( mode ) {
		case 'item':
		case 'user':
			jQuery( '#modules .panel-primary' ).removeClass( 'panel-primary' ).addClass( 'panel-info' );
			jQuery( '#find .btn' ).hide();
			break;
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

	if ( mode == 'multi-return' )
		jQuery( module ).removeClass( 'panel-primary' ).addClass( 'panel-info' );

	// Trim surplus
	jQuery( jQuery( '#modules .panel' ).splice( 5 ) ).remove();
} )

socket.on( 'flash', function( msg ) {
	clearFlash();
	var btn = '';
	if ( msg.btn ) {
		jQuery('.alert .btn' ).hide();
		btn = '<p class="pull-right" style="margin-top: 0; cursor:pointer;"><span class="' + msg.btn.class + ' glyphicon glyphicon-ok"></span></p>';
	}
	jQuery( '#status' ).html( '<p class="pull-left"><strong>' + msg.barcode + '</strong>: ' + msg.message + '</p>' + btn ).removeClass( 'alert-danger' ).removeClass( 'alert-info' ).removeClass( 'alert-success' ).removeClass( 'alert-warning' ).addClass( 'alert-' + msg.type );
	statusTimeout = setTimeout( clearFlash, msg.timer ? msg.timer : 5000 );
} )

socket.on( 'stats', function( msg ) {
	jQuery( '.issued' ).text( msg.issued );
	jQuery( '.returned' ).text( msg.returned );
	jQuery( '.available' ).text( msg.available );
	jQuery( '.onloan' ).text( msg.onloan );
	jQuery( '.lostbroken' ).text( msg.lostbroken );
	jQuery( '.audit' ).text( msg.audit );
} );

function modeUpdate( m ) {
	mode = m;
	console.log( "Mode: " + mode )

	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-search' );
	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-barcode' );
	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-user' );
	jQuery( '#find .glyphicon' ).removeClass( 'glyphicon-fire' );

	if ( mode == 'user' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-user' );
		jQuery( '#find' ).parent().css( 'background-color', '' );
	} else if ( mode == 'user-selected' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-barcode' );
		jQuery( '#find' ).parent().css( 'background-color', '#d9edf7' );
	} else if ( mode == 'item' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-barcode' );
		jQuery( '#find' ).parent().css( 'background-color', '' );
	} else if ( mode == 'item-selected' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-user' );
		jQuery( '#find' ).parent().css( 'background-color', '#d9edf7' );
	} else if ( mode == 'multi-return' ) {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-fire' );
		jQuery( '#find' ).parent().css( 'background-color', '#f2dede' );
	} else {
		jQuery( '#find .glyphicon' ).addClass( 'glyphicon-search' );
		jQuery( '#find' ).parent().css( 'background-color', '' );
	}
}

socket.on( 'loggedout', function() {
	window.location = '/login';
} );

function cancel() {
	modeUpdate( 'find' );
	jQuery( '#modules .panel-primary' ).removeClass( 'panel-primary' ).addClass( 'panel-info' );
	jQuery('#find .btn').hide();
	jQuery('#find .btn.multi-return').show().removeClass( 'btn-primary' ).addClass( 'btn-default' );
	jQuery( '#find input' ).val( '' );
}

function resetCancelTimeout() {
	clearTimeout( cancelTimeout );
	cancelTimeout = setTimeout( cancel, 60000 );
}

function clearFlash() {
	clearTimeout( statusTimeout );
	jQuery( '#status' ).html( '&nbsp;' ).removeClass( 'alert-danger' ).removeClass( 'alert-info' ).removeClass( 'alert-success' ).addClass( 'alert-warning' );
}
