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

	getRemoveEmail(req, res) {
		this.models.actions.getById(req.params.id)
		.then((selected) => {
			if (!selected) {
				req.flash('warning', 'That email is not in the queue')
				return req.saveSessionAndRedirect(this.getRoute())
			}

			if (selected.action != ACTIONS.PENDING_EMAIL) {
				if (selected.action == ACTIONS.EMAILED) {
					req.flash('warning', 'That email has already been sent')
				} else {
					req.flash('warning', 'That is not an email')
				}
				return req.saveSessionAndRedirect(this.getRoute())
			}

			res.render('confirm-remove', {selected})
		})
		.catch(err => {
			this.displayError(req, res, err, `${this.getRoute()}`)
		})
	}

	postRemoveEmail(req, res) {
		this.models.actions.getById(req.params.id)
		.then((selected) => {
			if (!selected) {
				req.flash('warning', 'That email is not in the queue')
				return req.saveSessionAndRedirect(this.getRoute())
			}

			if (selected.action != ACTIONS.PENDING_EMAIL) {
				if (selected.action == ACTIONS.EMAILED) {
					req.flash('warning', 'That email has already been sent')
				} else {
					req.flash('warning', 'That is not an email')
				}
				return req.saveSessionAndRedirect(this.getRoute())
			}

			this.models.actions.remove(selected.id)
			req.flash('success', 'Email removed from the queue')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => {
			this.displayError(req, res, err, `${this.getRoute()}`)
		})
	}


}

module.exports = OptionsController
