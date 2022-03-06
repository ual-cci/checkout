const BaseController = require('../../src/js/common/BaseController.js')

const Mail = require('../../src/js/mail')()

const config = require('./config.json')

class OptionsController extends BaseController {
	constructor() {
		super({path: config.path})
	}

	getRoot(req, res) {
		const counts = Mail._limiter.counts()
		let status = [
			{name: 'Received', count: counts.RECEIVED},
			{name: 'Queued', count: counts.QUEUED},
			{name: 'Running', count: counts.RUNNING},
			{name: 'Executing', count: counts.EXECUTING}
		]
		const queue = Mail._limiter.jobs()
		res.render('index', {status, queue})
	}
}

module.exports = OptionsController
