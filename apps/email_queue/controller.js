const BaseController = require('../../src/js/common/BaseController.js')

const {AVAILABILITY, ACTIONS} = require('../../src/js/common/constants')
const Actions = require('../../src/models/actions.js')

const config = require('./config.json')

class OptionsController extends BaseController {
	constructor() {
		super({path: config.path})
		this.models = {
			actions: new Actions()
		}
	}

	getRoot(req, res) {
		Promise.all([
			this.models.actions.getByAction(ACTIONS.PENDING_EMAIL),
			this.models.actions.getByAction(ACTIONS.EMAILED)
		])
		.then(([queue, sent]) => {
			res.render('index', {queue, sent})
		})
	}
}

module.exports = OptionsController
