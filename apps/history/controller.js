const moment = require('moment')

const BaseController = require('../../src/js/common/BaseController.js')

const Items = require('../../src/models/items.js')
const Users = require('../../src/models/users.js')
const Actions = require('../../src/models/actions.js')

const {getSortBy} = require('../../src/js/utils.js')
const {AVAILABILITY, SORTBY_MUTATIONS} = require('../../src/js/common/constants')

const config = require('./config.json')

class HistoryController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			items: new Items(),
			users: new Users(),
			actions: new Actions()
		}
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
		this.models.actions.getDateRange(
			moment().startOf('day'),
			moment().endOf('day')
		)
		.then(actions => {
			res.render('index', {actions})
		})
	}
}

module.exports = HistoryController
