const Options = require('./options')()
const nodemailer = require('nodemailer')

const Mail = {
	sendTemplate: (to, subject, template, tags) => {
		const text = Mail._replaceTags(template, tags)
		return Mail._send(to, subject, text)
	},

	_send: (to, subject, text) => {
		const transporter = nodemailer.createTransport(Options.getText('smtp_connection_url'))
		return transporter.sendMail({
			from: Options.getText('smtp_from_address'),
			to: to,
			subject: subject,
			text: text
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
	}
}

module.exports = Mail
