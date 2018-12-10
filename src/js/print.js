var __root = '../..';
var __src = __root + '/src';
var __js = __src + '/js';

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
			autoFirstPage: false
		} );

		var barcodes = [];
		for ( c in codes ) {
			var code = codes[c];
			switch( code.type ) {
				default:
				case '12mm':
					barcodes.push( Print.add12mmTape( doc, code.barcode, code.text ) )
					break;
			}
		}

		Promise.all( barcodes ).then( function() {
			doc.end();
		} );

		doc.on( 'data', buffer.push.bind( buffer ) );

		doc.on( 'end', function() {
			Print.send( buffer, printer );
		} );
	},
	add12mmTape: function( doc, barcode, text ) {
		return new Promise( function( resolve, reject ) {
			Print.generate2DBarcodeImage( barcode ).then( function( png ) {
				var page = doc.addPage( {
					size: [ pt(20), pt(10) ],
					layout: 'landscape',
					margin: 0
				} );
				page.fontSize( 4.5 );
				page.font('Helvetica-Bold')

				page.text( "Creative\nTechnology\nLab", pt(0), pt(1), {
					width: pt(10),
					align: 'left',
					weight: 'bold',
					lineGap: -1.5
				} );

				page.image( png,  pt(0), pt(6), {
					width: pt(9),
					height: pt(9)
				} );

				page.fontSize( 4 );
				page.font('Helvetica')
				page.text( barcode, pt(0), pt(16), {
					width: pt(9),
					align: 'left'
				} );

				resolve( page );
			} )
		} );
	},
	generate2DBarcodeImage: function( barcode ) {
		return new Promise( function ( resolve, reject ) {
			bwipjs.toBuffer( {
				bcid: 'azteccode',
				scale: 20,
				text: barcode,
				height: 10,
				width: 10,
				rotate: 'N',
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
				"requesting-user-name": process.env.APP_NAME,
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
