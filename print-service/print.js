require('dotenv-safe').config({allowEmptyValues: true});

const fs = require('fs')

const PDFDocument = require('pdfkit')
const bwipjs = require('bwip-js')
const ipp = require('@sealsystems/ipp')

const {Worker} = require('bullmq')
const Options = require('../src/js/options')()

const worker = new Worker('Labels', jobHandler, {
	connection: {
		port: process.env.REDIS_PORT,
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PASSWORD,
		tls: process.env.REDIS_TLS == 'true' ? true : false,
	}
})

function jobHandler(job) {
	return new Promise((resolve, reject) => {
		console.log(`🎉 New Job: #${job.id} ${job.name}`)

		const doc = new PDFDocument({
			autoFirstPage: false
		})

		// Send labels to temp folder if it exists
		if (fs.existsSync('temp_pdfs/')) {
			const item_code = job.data.labels.length > 0 ? job.data.labels[0].barcode : 'string'
			const filePath = 'temp_pdfs/'+ item_code +'.pdf'
			doc.pipe(fs.createWriteStream(filePath))
		}

		let buffer = []
		let media = ''
		let barcodes = []

		doc.on('data', buffer.push.bind(buffer))

		doc.on('end', () => {
			Print.send(buffer, {
				url: job.data.printer_url,
				media: media,
				jobName: `${Options.getText('application_name')} - ${job.data.user}`,
				userName: job.data.user
			})
			resolve('Label(s) generated and sent to print')
		})

		const brand = Options.getText('label_brand').replace(/\r\n|\r/g, '\n')

		job.data.labels.forEach(label => {
			switch(label.type) {
				default:
				case '9mm':
					media = "Custom.9x12mm"
					barcodes.push(Print.add9mmLabel(doc, label.barcode))
					break

				case '12mm':
					media = "Custom.12x17mm"
					barcodes.push(Print.add12mmLabel(doc, brand, label.barcode))
					break

				case '12mm_flag':
					media = "Custom.12x50mm"
					barcodes.push(Print.add12mmFlag(doc, brand, label.barcode))
					break

				case '36mm':
					media = "Custom.36x36mm"
					barcodes.push(Print.add36mmLabel(doc, label.barcode))
					break
			}
		})

		Promise.all(barcodes).then(() => {
			doc.end()
		})
	})
}

const Print = {
	add9mmLabel: (doc, barcode) => {
		return new Promise(function(resolve, reject) {
			Print.generate2DBarcodeImage(barcode).then(png => {
				const page = doc.addPage({
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
	add12mmLabel: (doc, brand, barcode) => {
		return new Promise((resolve, reject) => {
			Print.generate2DBarcodeImage(barcode).then(png => {
				const page = doc.addPage({
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
	add12mmFlag: (doc, brand, barcode) => {
		return new Promise((resolve, reject) => {
			const w = 12
			const h = 50
			Print.generate2DBarcodeImage(barcode).then(png => {
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
	add36mmLabel: (doc, barcode) => {
		return new Promise((resolve, reject) => {
			Print.generate2DBarcodeImage(barcode).then(png => {
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

				page.text(barcode, pt(0), pt(29), {
					width: pt(36),
					align: 'center'
				})

				resolve(page)
			})
		})
	},
	generate2DBarcodeImage: (barcode) => {
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
	send: (buffer, options) => {
		const file = {
			'job-attributes-tag': {
				'media': [options.media]
			},
			'operation-attributes-tag': {
				'requesting-user-name': options.userName,
				'job-name': options.jobName,
				'document-format': 'application/pdf'
			},
			data: Buffer.concat(buffer)
		}

		const printer = ipp.Printer(options.url)
		printer.execute("Print-Job", file, (err, res) => {
			if (err) throw err
			delete buffer
		})
	}
}

function pt(mm) {
	return mm * 2.834645669291
}
