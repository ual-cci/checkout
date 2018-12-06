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
			autoFirstPage: false
		} );

		var barcodes = [];
		for ( c in codes ) {
			var code = codes[c];
			switch( code.type ) {
				case '2d_tape':
					barcodes.push( Print.addTape( doc, code.barcode, code.text ) )
					break;
				case '2d_compact':
					barcodes.push( Print.addCompactLabel( doc, code.barcode, code.text ) )
					break;
				case '2d_flag':
					barcodes.push( Print.addFlagLabel( doc, code.barcode, code.text ) )
					break;
				default:
				case '1d_reg':
					barcodes.push( Print.addRegularLabel( doc, code.barcode, code.text ) )
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
	addRegularLabel: function( doc, barcode, text ) {
		return new Promise( function( resolve, reject ) {
			Print.generate1DBarcodeImage( barcode ).then( function( png ) {
				var page = doc.addPage( {
					size: [ pt(20), pt(40) ],
					layout: 'portrait',
					margin: 0
				} );
				page.fontSize( 7 );
				page.rotate( 90 );
				if ( text ) {
					page.text( text, pt(2), pt(-17), {
						width: pt(35),
						align: 'center'
					} );
				}
				page.text( barcode, pt(2), pt(-4), {
					width: pt(35),
					align: 'left'
				} );
				page.rotate(-90);
				page.image( png,  pt(5), pt(2), {
					width: pt(5),
					height: pt(35)
				} );
				resolve( page );
			} )
		} );
	},
	addFlagLabel: function( doc, barcode, text ) {
		return new Promise( function( resolve, reject ) {
			Print.generate2DBarcodeImage( barcode ).then( function( png ) {
				var page = doc.addPage( {
					size: [ pt(20), pt(40) ],
					layout: 'portrait',
					margin: 0
				} );
				if ( text ) {
					page.rotate( 90 );
					page.fontSize( 7 );
					page.text( text, pt(2), pt(-17.5), {
						width: pt(35),
						align: 'center'
					} );
					page.rotate( -90 );
				}

				page.fontSize( 5 );

				page.image( png,  pt(2), pt(2), {
					width: pt(8),
					height: pt(8)
				} );
				page.text( barcode, pt(1), pt(12), {
					width: pt(10),
					align: 'center'
				} );

				page.moveTo( pt(0), pt(20) )
					.lineTo( pt(12), pt(20) )
					.dash( 1, { space: 3 } )
					.stroke();

				page.rotate( 180 );
					page.text( barcode, pt(-11), pt(-28), {
						width: pt(10),
						align: 'center'
					} );
					page.image( png,  pt(-10), pt(-38), {
						width: pt(8),
						height: pt(8)
					} );
				page.rotate( -180 );
				resolve( page );
			} )
		} );
	},
	addCompactLabel: function( doc, barcode, text ) {
		return new Promise( function( resolve, reject ) {
			Print.generate2DBarcodeImage( barcode ).then( function( png ) {
				var page = doc.addPage( {
					size: [ pt(20), pt(40) ],
					layout: 'portrait',
					margin: 0
				} );
				if ( text ) {
					page.rotate( 90 );
					page.fontSize( 7 );
					page.text( text, pt(2), pt(-17.5), {
						width: pt(35),
						align: 'center'
					} );
					page.rotate( -90 );
				}

				page.fontSize( 5 );
				for ( var offset = 0; offset < 3; offset++ ) {
					var off = offset * 12;
					page.text( barcode, pt(2), pt(off+10), {
						width: pt(10),
						align: 'center'
					} );
					page.image( png,  pt(4), pt(off+3), {
						width: pt(6),
						height: pt(6)
					} );
				}
				resolve( page );
			} )
		} );
	},
	addTape: function( doc, barcode, text ) {
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
	generate1DBarcodeImage: function( barcode ) {
		return new Promise( function ( resolve, reject ) {
			bwipjs.toBuffer( {
				bcid: 'code128',
				scale: 10,
				text: barcode,
				height: 5,
				width: 35,
				rotate: 'R',
				monochrome: true
			}, function( err, png ) {
				if ( err ) return reject( err );
				return resolve( png );
			} );
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
