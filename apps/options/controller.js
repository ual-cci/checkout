const BaseController = require('../../src/js/common/BaseController.js')

const Options = require('../../src/js/options')()

const config = require('./config.json')

class OptionsController extends BaseController {
	constructor() {
		super({path: config.path})
	}

	getRoot(req, res) {
		const opts = Options.getAll()
		res.render('index', {options: opts, keys:Object.keys(opts)})
	}

	getEdit(req, res) {
		const opt = Options.get(req.params.id)
		if (opt) {
			res.render('edit', {option: opt, key:req.params.id})
		} else {
			req.flash('danger', 'Option not found')
			return req.saveSessionAndRedirect(this.getRoute())
		}
	}

	postEdit(req, res) {
		Options.set(req.params.id, req.body.value, (result) => {
			if (result) {
				req.flash('success', 'Option updated')
			} else {
				req.flash('danger', 'Option not found')
			}
			req.saveSessionAndRedirect(this.getRoute())
		})
	}

	getReset(req, res) {
		const opt = Options.get(req.params.id)
		if (opt) {
			res.render('confirm-reset', {key:req.params.id})
		} else {
			req.flash('danger', 'Option not found')
			return req.saveSessionAndRedirect(this.getRoute())
		}
	}

	postReset(req, res) {
		Options.reset(req.params.id, (result) => {
			if (result) {
				req.flash('success', 'Option reset')
			} else {
				req.flash('danger', 'Option not found')
			}
			req.saveSessionAndRedirect(this.getRoute())
		})
	}
}

module.exports = OptionsController
