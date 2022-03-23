const Options = require('./options')()
const nodemailer = require('nodemailer')
const Bottleneck = require('bottleneck/es5')

const Mail = {
	_transporter: null,
	_limiter: null,

	queueTemplate: (to, replyTo, subject, template, tags) => {
		const msg = {
			from: Options.getText('smtp_from_address'),
			to: to,
			replyTo: replyTo,
			subject: subject,
			text: Mail._replaceTags(template, tags)
		}

		const msgID = `${msg.to.name} - ${msg.to.address} - ${new Date()}`
		
		Mail._limiter.wrap(Mail._send).withOptions({id: msgID}, msg)
			.then((result) => {
				console.log(`Message sent - ${result}`)
			})
			.catch((error) => {
				console.log(`Message error - ${error}`)
			})
	},

	_send: (msg) => {
		return new Promise((resolve, reject) => {
			Mail._transporter.sendMail(msg, (err, info) => {
				if (err) {
					console.log(err)
					reject(err.message)
				}
				resolve(info.messageId)
			})
		})
	},

	_replaceTags: (template, tags) => {
		const keys = Object.keys(tags)
		const values = Object.values(tags)
		keys.forEach((key, i) => {
			let exp = new RegExp(`\\[${key}\\]`, '')
			template = template.replace(exp, values[i] ? values[i] : '')
		})
		return template
	},

	_firstRun: () => {
		Mail._connectSMTP()

		// This should be abstracted with options and something to update the bottleneck settings, for now just restart the server
		const messagesPer = 30
		const timeSpan = 60000

		Mail._limiter = new Bottleneck({
			reservoir: messagesPer,
			reservoirRefreshAmount: messagesPer,
			reservoirRefreshInterval: timeSpan,
			maxConcurrent: 1,
			minTime: timeSpan / messagesPer,
		})
	},

	_connectSMTP() {
		try {
			const conn = {
				host: Options.getText('smtp_url'),
				port: Options.getText('smtp_port'),
				secure: Options.getBoolean('smtp_secure'),
				auth: {
				  user: Options.getText('smtp_username'),
				  pass: Options.getText('smtp_password'),
				},
			}
			Mail._transporter = nodemailer.createTransport(conn)
		} catch (error) {
			console.error(error);
		}
	},

	// Currently options has no change hook to trigger this - just restart the server for now
	reconnectSMTP() {
		try {
			Mail._transporter.close()
		} catch (error) {
			console.error(error)
		}

		Mail._connectSMTP()
	}
}

module.exports = function() {
	if (global.CheckoutMail === undefined) {
		global.CheckoutMail = Mail

		// This makes sure the options data is populated before trying to establish an SMTP connection
		const optionsWait = setInterval(() => {
			if (Options.ready) {
				Mail._firstRun();
				Mail.ready = true
				clearInterval(optionsWait)
			}
		}, 100)
	}
	return global.CheckoutMail;
}