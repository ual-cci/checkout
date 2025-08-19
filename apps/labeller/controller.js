const moment = require('moment')

const BaseController = require('../../src/js/common/BaseController.js')
const config = require('./config.json')
const auth = require('../../src/js/authentication')

const Print = require('../../src/js/print')
const Options = require('../../src/js/options')()

const validTypes = [
	'9mm',
	'9mm_flag',
	'compact_12mm',
	'compact_12mm_flag',
	'12mm',
	'12mm_flag',
	'36mm'
]

class LabellerController extends BaseController {
	constructor() {
		super({path: config.path})
	}

	/**
	* Builds the data necessary for the home page
	* with the relevant ordering inferred by the query
	* parameters
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getRoot(req, res) {
		let type = 'compact_12mm'

		if (validTypes.includes(req.query.type)) {
			type = req.query.type
		}

		res.render('index', {type})
	}

	postRoot(req, res) {
		let labels = []
		const start = Options.getInt('labeller_last_seq')
		const type = req.body.label || 'compact_12mm'
		const count = parseInt(req.body.qty) || 1
		const dupe = parseInt(req.body.dupe) || 1

		if (!req.user.printer_id) {
			req.flash('danger', `You have not selected a printer.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		if (!validTypes.includes(req.body.label)) {
			req.flash('danger', `Invalid label type selected.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		if (count > 100) {
			req.flash('danger', `You cannot print more than 100 labels at a time.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		if (count < 0) {
			req.flash('danger', `You must print at least 1 label.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}
		
		if (dupe > 3) {
			req.flash('danger', `You cannot print more than 3 duplicates of each label.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		if (dupe < 0) {
			req.flash('danger', `You must print at least 1 instance of each label.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		if (!auth.userCan(req.user, 'labeller_duplicate') && dupe != 1) {
			req.flash('danger', `You do not have access to the duplicate feature, only 1 copy of each label has been printed.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint?type=${type}`)
			return;
		}

		for (let num = start; num < start + count; num++) {
			let code = formatNum(num)
			const label = {
				barcode: Options.getText('labeller_prefix') + code,
				text: spaceFormat(code),
				type: type
			}
			// Handle adding duplicates
			for (let d = 0; d < dupe; d++) {
				labels.push(label)
			}
		}

		Options.set('labeller_last_seq', start + count, () => {})

		Print.labels(labels, req.user.printer_url)

		if (count == 1) {
			req.flash('success', `A label "${formatNum(start)}" was printed to "${req.user.printer_name}".`)
		} else {
			req.flash('success', `${count} labels from "${formatNum(start)}" to "${formatNum(start+count)}" were printed to "${req.user.printer_name}".`)
		}
		req.saveSessionAndRedirect(`${this.getRoute()}?type=${type}`)
	}

	getReprint(req, res) {
		let type = 'compact_12mm'

		if (validTypes.includes(req.query.type)) {
			type = req.query.type
		}

		res.render('reprint', {type, max_length: Options.getInt('labeller_length')})
	}

	postReprint(req, res) {
		let labels = []
		const type = req.body.label || 'compact_12mm'
		const count = parseInt(req.body.qty) || 1
		let code = req.body.code.toUpperCase()

		if (!req.user.printer_id) {
			req.flash('danger', `You have not selected a printer.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint`)
			return;
		}
		
		if (!validTypes.includes(req.body.label)) {
			req.flash('danger', `Invalid label type selected.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint`)
			return;
		}

		if (count > 3) {
			req.flash('danger', `You cannot print more than 3 labels at a time.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint?type=${type}`)
			return;
		}

		if (count < 0) {
			req.flash('danger', `You must print at least 1 label.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint?type=${type}`)
			return;
		}

		if (code.length > Options.getInt('labeller_length')) {
			req.flash('danger', `Label should not be longer than ${Options.getInt('labeller_length')} characters.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint?type=${type}`)
			return;
		}

		if (code.length < Options.getInt('labeller_length')) {
			req.flash('danger', `Label should not be at least ${Options.getInt('labeller_length')} characters.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint?type=${type}`)
			return;
		}

		if (!code.match(/([A-F0-9]{6})/)) {
			req.flash('danger', `Label should be in hexadecimal format (0-F).`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint?type=${type}`)
			return;
		}

		if (!auth.userCan(req.user, 'labeller_duplicate') && count != 1) {
			req.flash('danger', `You do not have access to the duplicate feature, only 1 copy of each label has been printed.`)
			req.saveSessionAndRedirect(`${this.getRoute()}/reprint?type=${type}`)
			return;
		}
		
		const label = {
			barcode: Options.getText('labeller_prefix') + code,
			text: spaceFormat(code),
			type: type
		}
		for (let d = 0; d < count; d++) {
			labels.push(label)
		}
		Print.labels(labels, req.user.printer_url)

		req.flash('success', `A label "${code}" was printed to "${req.user.printer_name}".`)
		req.saveSessionAndRedirect(`${this.getRoute()}/reprint/?type=${type}`)
	}
}

function spaceFormat(input) {
	return input.match(/.{1,3}/g).join(' ');
}

function formatNum(num) {
    return num.toString(16).toUpperCase().padStart(Options.getInt('labeller_length'), '0')
}

module.exports = LabellerController
