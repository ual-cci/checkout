const PDFDocument = require('pdfkit')
const bwipjs = require('bwip-js')
const ipp = require('ipp')
const fs = require('fs')

const Options = require('./options')()

const Print = {
	label: function(code, printer) {
		Print.labels([code], printer)
	},
	labels: function(codes, printer) {
		let buffer = []
		let size = ''

		const doc = new PDFDocument({
			autoFirstPage: false
		})

		if (!fs.existsSync('temp_pdfs/')) fs.mkdirSync('temp_pdfs/');

		let item_code = codes.length > 0 ? codes[0].barcode : 'string'
		doc.pipe(fs.createWriteStream('temp_pdfs/'+ item_code +'.pdf'));

		const docSize = ''
		let barcodes = []
		for (c in codes) {
			const code = codes[c]
			switch(code.type) {
				default:
				case '9mm':
					size = "Custom.9x10mm"
					barcodes.push(Print.add9mmLabel(doc, code.barcode, code.text))
					break

				case '9mm_flag':
					size = "Custom.9x35mm"
					barcodes.push(Print.add9mmFlag(doc, code.barcode, code.text))
					break

				case '12mm':
					size = "Custom.12x17mm"
					barcodes.push(Print.add12mmLabel(doc, code.barcode, code.text))
					break

				case '12mm_flag':
					size = "Custom.12x50mm"
					barcodes.push(Print.add12mmFlag(doc, code.barcode, code.text))
					break

				case 'compact_12mm':
					size = "Custom.12x14mm"
					barcodes.push(Print.addCompact12mmLabel(doc, code.barcode, code.text))
					break

				case 'compact_12mm_flag':
					size = "Custom.12x50mm"
					barcodes.push(Print.addCompact12mmFlag(doc, code.barcode, code.text))
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
	add9mmLabel: (doc, barcode, text) => {
		return new Promise((resolve, reject) => {
			Print.generate2DBarcodeImage(barcode).then((png) => {
				const page = doc.addPage({
					size: [pt(10), pt(9)],
					layout: 'landscape',
					margin: 0
				})

				page.image(png, pt(1), pt(1), {
					width: pt(7),
					height: pt(7)
				})

				page.fontSize(3.33)
                page.font('Helvetica-Bold')

				page.text(text, pt(1), pt(8.5), {
					width: pt(7),
					align: 'center'
				})

				resolve(page)
			})
		})
	},
	add9mmFlag: (doc, barcode, text) => {
		return new Promise((resolve, reject) => {
			const w = 9
			const h = 35
			Print.generate2DBarcodeImage(barcode).then((png) => {
				const page = doc.addPage({
					size: [pt(h), pt(w)],
					layout: 'landscape',
					margin: 0
				})

				for (let i = 0; i < 2; i++) {
					if (i == 1) {
						doc.save()
						doc.rotate(180, {
							origin:[pt(w/2), pt(h/2)]
						})
					}

					page.image(png, pt(1), pt(1), {
						width: pt(7),
						height: pt(7)
					})

					page.fontSize(3.33)
					page.font('Helvetica-Bold')

					page.text(text, pt(1), pt(8.5), {
						width: pt(7),
						align: 'center'
					})
				}

				doc.restore()
				page.moveTo(pt(0), pt(h/2))
					.lineTo(pt(w),pt(h/2))
					.lineWidth(pt(0.25))
					.lineCap('round')
					.dash(pt(0.125), {space:pt(2)})
					.stroke()

				resolve(page)
			})
		})
	},
	add12mmLabel: (doc, barcode, text) => {
		return new Promise((resolve, reject) => {
			Print.generate2DBarcodeImage(barcode).then((png) => {
				const page = doc.addPage({
					size: [pt(17), pt(12)],
					layout: 'landscape',
					margin: 0
				})
				page.fontSize(4.5)
				page.font('Helvetica-Bold')

				page.text(Options.getText('label_brand').replace(/\r\n|\r/g, '\n'), pt(1), pt(1), {
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
				page.text(text, pt(1), pt(15), {
					width: pt(9),
					align: 'left'
				})

				resolve(page)
			})
		})
	},
	add12mmFlag: (doc, barcode, text) => {
		return new Promise((resolve, reject) => {
			const w = 12
			const h = 50
			Print.generate2DBarcodeImage(barcode).then((png) => {
				const page = doc.addPage({
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

					page.text(Options.getText('label_brand').replace(/\r\n|\r/g, '\n'), pt(1), pt(1), {
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
					page.text(text, pt(1), pt(16), {
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
	addCompact12mmLabel: (doc, barcode, text) => {
		return new Promise((resolve, reject) => {
			Print.generate2DBarcodeImage(barcode).then((png) => {
                const page = doc.addPage({
                    size: [pt(14), pt(12)],
                    layout: 'landscape',
                    margin: 0
                })

                page.image(png, pt(1), pt(1), {
                    width: pt(10),
                    height: pt(10)
                })

                page.fontSize(4.75)
                page.font('Helvetica-Bold')
                
                page.text(text, pt(1), pt(12), {
                    width: pt(10),
                    align: 'center'
                })

                resolve(page)
			})
		})
	},
	addCompact12mmFlag: (doc, barcode, text) => {
		return new Promise((resolve, reject) => {
			const w = 12
			const h = 50
			Print.generate2DBarcodeImage(barcode).then((png) => {
				const page = doc.addPage({
					size: [pt(h), pt(w)],
					layout: 'landscape',
					margin: 0
				})

				for (let i = 0; i < 2; i++) {
					if (i == 1) {
						doc.save()
						doc.rotate(180, {
							origin:[pt(w/2), pt(h/2)]
						})
					}

					page.image(png, pt(1), pt(1), {
						width: pt(10),
						height: pt(10)
					})

					page.fontSize(4.75)
					page.font('Helvetica-Bold')
					page.text(text, pt(1), pt(12), {
						width: pt(10),
						align: 'center'
					})
				}

				doc.restore()
				page.moveTo(pt(0), pt(h/2))
					.lineTo(pt(w),pt(h/2))
					.lineWidth(pt(0.25))
					.lineCap('round')
					.dash(pt(0.125), {space:pt(2)})
					.stroke()

				resolve(page)
			})
		})
	},
	add36mmLabel: (doc, barcode, text) => {
		return new Promise((resolve, reject) => {
			Print.generate2DBarcodeImage(barcode).then((png) => {
				const page = doc.addPage({
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
	generate2DBarcodeImage: (barcode) => {
		return new Promise((resolve, reject) => {
			bwipjs.toBuffer({
				bcid: 'azteccode',
				scale: 20,
				text: barcode,
				height: 10,
				width: 10,
				rotate: 'N',
				monochrome: true
			}, (err, png) => {
				if (err) return reject(err)
					return resolve(png)
			})
		})
	},
	send: (buffer, printer_url, size) => {
		const file = {
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

		const printer = ipp.Printer(printer_url)
		printer.execute("Print-Job", file, (err, res) => {
			delete buffer
		})
	},
}

function pt(mm) {
	return mm * 2.834645669291
}

module.exports = Print
