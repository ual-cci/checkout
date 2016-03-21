var config = require( './config.json' );

var Items = require( './models/items.js' );
var fs = require( 'fs' );

var mongoose = require( 'mongoose' );
mongoose.connect( config.mongo );

String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

var items = [];
var file = fs.readFileSync( __dirname + '/insert.csv' ).toString();

file = file.split( "\n" );

for ( i in file ) {
	var item = file[i].split( ',' );
	var name = item[1].trim();

	if ( /^([A-Z]{2,4}) ([0-9]{1,2})$/.exec( item[0] ) != null ) {
		var range = /^([A-Z]{2,4}) ([0-9]{1,2})$/.exec( item[0] );
		var prefix = range[1];
		var id = range[2];
		items.push( {
			name: name + ' #' + id.toString().lpad( 0, 2 ),
			barcode: prefix + ' ' + id.toString().lpad( 0, 2 )
		} );
	} else if ( /^([A-Z]{2,4}) ([0-9]{1,2})-([0-9]{1,2})$/.exec( item[0] ) != null ) {
		var range = /^([A-Z]{2,4}) ([0-9]{1,2})-([0-9]{1,2})$/.exec( item[0] );
		var prefix = range[1];
		var start = range[2];
		var end = range[3];
		for ( i = start; i <= end; i++ ) {
			items.push( {
				name: name + ' #' + i.toString().lpad( 0, 2 ),
				barcode: prefix + ' ' + i.toString().lpad( 0, 2 )
			} );
		}
	} else {
		console.log( 'no match for: ' + item[0] );
	}
}

// console.log( items );

if ( items.length > 0 ) {
	for ( item in items ) {
		var item = items[item];
		new Items( {
			_id: require('mongoose').Types.ObjectId(),
			name: item.name,
			barcode: item.barcode
		} ).save( function ( err ) {
			console.log( 'added: ' + err );
		} );
	}
}