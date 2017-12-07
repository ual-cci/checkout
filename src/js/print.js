var __root = '../..';
var __src = __root + '/src';
var __js = __src + '/js';
var __config = __root + '/config/config.json';

var config = require( __config );

var PDFDocument = require( 'pdfkit' );
var bwipjs = require( 'bwip-js' );
var ipp = require( 'ipp' );

var Print = {
	label: function( code, printer ) {
		Print.labels( [ code ], printer );
	},
	labels: function( codes, printer ) {
		var buffer = [];

		var doc = new PDFDocument( {
			size: [ pt(12), pt(50) ],
			layout: 'portrait',
			margin: 0,
			autoFirstPage: false
		} );

		var barcodes = [];
		for ( c in codes ) {
			barcodes.push( Print.addLabel( doc, codes[c] ) )
		}

		Promise.all( barcodes ).then( function() {
			doc.end();
		} );

		doc.on( 'data', buffer.push.bind( buffer ) );

		doc.on( 'end', function() {
			Print.send( buffer, printer );
		} );
	},
	addLabel: function( doc, barcode ) {
		return new Promise( function( resolve, reject ) {
			Print.generateBarcodeImage( barcode ).then( function( png ) {
				var page = doc.addPage();
				page.fontSize( 7 );
				page.rotate( 90 );
				page.text( barcode, pt(4), pt(-4), {
					width: pt(30),
					align: 'left'
				} );
				page.rotate(-90);
				page.image( png,  pt(5), pt(2), {
					width: pt(5),
					height: pt(30)
				} );
				resolve( page );
			} )
		} );
	},
	generateBarcodeImage: function( barcode ) {
		return new Promise( function ( resolve, reject ) {
			bwipjs.toBuffer( {
				bcid: 'code128',
				scale: 10,
				text: barcode,
				height: 5,
				width: 30,
				rotate: 'R',
				monochrome: true
			}, function( err, png ) {
				if ( err ) return reject( err );
				return resolve( png );
			} );
		} );
	},
	send: function( buffer, printer ) {
		var file = {
			"operation-attributes-tag": {
				"requesting-user-name": config.name,
				"job-name": "Labels",
				"requesting-user-name": "Checkout",
				"document-format": "application/pdf"
			},
			data: Buffer.concat( buffer )
		};

		var printer = ipp.Printer( printer );
		printer.execute( "Print-Job", file, function ( err, res ) {
			delete buffer;
		});
	},
};

function pt( mm ) {
	return mm * 2.834645669291;
}

module.exports = Print;
