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
		res.redirect(this.getRoute(`/${moment().format('YYYY-MM-DD')}`))
	}

	getDay(req, res) {
		const current_date = moment(req.params.date, 'YYYY-MM-DD', true)

		if (!current_date.isValid()) {
			req.flash('warning', `Invalid date`)
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		if (current_date.isBefore(moment('2000-01-01'))) {
			req.flash('warning', `Dates before 2000 are not supported`)
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		if (current_date.isAfter(moment())) {
			req.flash('warning', `Dates in the future are not supported`)
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		const start_date = moment(current_date).startOf('day')
		const end_date = moment(current_date).endOf('day')
		const previous_date = moment(current_date).subtract(1, 'day')
		const next_date = moment(current_date).add(1, 'day')

		this.models.actions.getDateRange(start_date, end_date)
		.then(actions => {
			res.render('index', {
				actions,
				current_date: current_date.format("dddd Do MMMM YYYY"),
				previous_url: `/history/${previous_date.format('YYYY-MM-DD')}`,
				next_url: next_date.isBefore(moment()) ? `/history/${next_date.format('YYYY-MM-DD')}` : ''
			})
		})
	}
}

module.exports = HistoryController
