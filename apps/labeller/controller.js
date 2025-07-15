const moment = require('moment')

const BaseController = require('../../src/js/common/BaseController.js')
const config = require('./config.json')

const Print = require('../../src/js/print')
const Options = require('../../src/js/options')()

const validTypes = [
	'9mm',
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
		const count = parseInt(req.body.qty) || 1
		const type = req.body.label || 'compact_12mm'

		if (!validTypes.includes(req.body.label)) {
			req.flash('danger', `Invalid label type selected.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		if (count > 25) {
			req.flash('danger', `You cannot print more than 25 labels at a time.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		if (count < 0) {
			req.flash('danger', `You must print at least 1 label.`)
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}
		
		for (let num = start; num < start + count; num++) {
			let code = formatNum(num)
			const label = {
				barcode: Options.getText('labeller_prefix') + code,
				text: spaceFormat(code),
				type: type
			}
			labels.push(label)
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
}

function spaceFormat(input) {
	return input.match(/.{1,3}/g).join(' ');
}

function formatNum(num) {
    return num.toString(16).toUpperCase().padStart(Options.getInt('labeller_length'), '0')
}

module.exports = LabellerController
