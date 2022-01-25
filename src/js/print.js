const PDFDocument = require('pdfkit')
const bwipjs = require('bwip-js')
const ipp = require('ipp')

const Options = require('./options')()

const Print = {
	label: function(code, printer) {
		Print.labels([code], printer)
	},
	labels: function(codes, printer) {
		var buffer = []

		var doc = new PDFDocument({
			autoFirstPage: false
		})

		var docSize = ''
		var barcodes = []
		for (c in codes) {
			var code = codes[c]
			switch(code.type) {
				default:
				case '9mm':
					size = "Custom.9x12mm"
					barcodes.push(Print.add9mmLabel(doc, code.barcode, code.text, code.brand))
					break

				case '12mm':
					size = "Custom.12x17mm"
					barcodes.push(Print.add12mmLabel(doc, code.barcode, code.text, code.brand))
					break

				case '12mm_flag':
					size = "Custom.12x50mm"
					barcodes.push(Print.add12mmFlag(doc, code.barcode, code.text, code.brand))
					break

				case '36mm':
					size = "Custom.36x36mm"
					barcodes.push(Print.add36mmLabel(doc, code.barcode, code.text))
					break
			}
		}

		Promise.all(barcodes).then(function() {
			doc.end()
		})

		doc.on('data', buffer.push.bind(buffer))

		doc.on('end', function() {
			Print.send(buffer, printer, size)
		})
	},
	add9mmLabel: function(doc, barcode, text) {
		return new Promise(function(resolve, reject) {
			Print.generate2DBarcodeImage(barcode).then(function(png) {
			var page = doc.addPage({
				size: [pt(10), pt(9)],
				layout: 'landscape',
				margin: 0
			})

			page.image(png, pt(1), pt(1), {
				width: pt(7),
				height: pt(7)
			})

			page.fontSize(3)
			page.font('Helvetica')
			
			page.text(barcode, pt(1), pt(8.5), {
				width: pt(7),
				align: 'left'
			})

			resolve(page)
			})
		})
	},
	add12mmLabel: function(doc, barcode, text, brand) {
		return new Promise(function(resolve, reject) {
			Print.generate2DBarcodeImage(barcode).then(function(png) {
			var page = doc.addPage({
				size: [pt(17), pt(12)],
				layout: 'landscape',
				margin: 0
			})
			page.fontSize(4.5)
			page.font('Helvetica-Bold')

			page.text(brand, pt(1), pt(1), {
				width: pt(10),
				align: 'left',
				weight: 'bold',
				lineGap: -1.5
			})

			page.image(png, pt(1), pt(5.5), {
				width: pt(9),
				height: pt(9)
			})

			page.fontSize(4)
			page.font('Helvetica')
			page.text(barcode, pt(1), pt(15), {
				width: pt(9),
				align: 'left'
			})

			resolve(page)
			})
		})
	},
	add12mmFlag: function(doc, barcode, text, brand) {
		return new Promise(function(resolve, reject) {
			var w = 12
			var h = 50
			Print.generate2DBarcodeImage(barcode).then(function(png) {
				var page = doc.addPage({
					size: [pt(h), pt(w)],
					layout: 'landscape',
					margin: 0
				})
				for (var i = 0; i < 2; i++) {
					if (i == 1) {
						doc.save()
						doc.rotate(180, {
							origin:[pt(w/2), pt(h/2)]
						})
					}

					page.fontSize(4.5)
					page.font('Helvetica-Bold')

					page.text(brand, pt(1), pt(1), {
						width: pt(10),
						align: 'left',
						weight: 'bold',
						lineGap: -1.5
					})

					page.image(png, pt(1), pt(6), {
						width: pt(9),
						height: pt(9)
					})

					page.fontSize(4)
					page.font('Helvetica')
					page.text(barcode, pt(1), pt(16), {
						width: pt(9),
						align: 'left'
					})
				}

				doc.restore()
				page.moveTo(pt(0), pt(h/2))
					.lineTo(pt(w),pt(h/2))
					.lineWidth(pt(0.25))
					.lineCap('round')
					.dash(pt(0.25), {space:pt(1)})
					.stroke()

				resolve(page)
			})
		})
	},
	add36mmLabel: function(doc, barcode, text) {
		return new Promise(function(resolve, reject) {
			Print.generate2DBarcodeImage(barcode).then(function(png) {
				var page = doc.addPage({
					size: [pt(36), pt(36)],
					layout: 'landscape',
					margin: 0
				})
				page.image(png,	pt(5.5), pt(2), {
					width: pt(25),
					height: pt(25)
				})

				page.fontSize(15)
				page.font('Helvetica-Bold')

				page.text(text, pt(0), pt(29), {
					width: pt(36),
					align: 'center'
				})

				resolve(page)
			})
		})
	},
	generate2DBarcodeImage: function(barcode) {
		return new Promise(function(resolve, reject) {
			bwipjs.toBuffer({
				bcid: 'azteccode',
				scale: 20,
				text: barcode,
				height: 10,
				width: 10,
				rotate: 'N',
				monochrome: true
			}, function(err, png) {
				if (err) return reject(err)
					return resolve(png)
			})
		})
	},
	send: function(buffer, printer, size) {
		var file = {
			"job-attributes-tag": {
				"media": [size]
			},
			"operation-attributes-tag": {
				"requesting-user-name": Options.getText('application_name'),
				"job-name": "Labels",
				"document-format": "application/pdf",
			},
			data: Buffer.concat(buffer)
		}

		var printer = ipp.Printer(printer)
		printer.execute("Print-Job", file, function (err, res) {
			delete buffer
		})
	},
}

function pt(mm) {
	return mm * 2.834645669291
}

module.exports = Print
