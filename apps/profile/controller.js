const BaseController = require('../../src/js/common/BaseController.js')
const config = require('./config.json')

const auth = require('../../src/js/authentication.js')
const moment = require('moment')

const Users = require('../../src/models/users.js')
const Printers = require('../../src/models/printers.js')
const Templates = require('../../src/models/templates.js')

const ItemColumns = require('../items/columns.json')

class ProfileController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			users: new Users(),
			printers: new Printers(),
			templates: new Templates()
		}
	}

	/**
	* Displays current users profile
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getRoot(req, res) {
		Promise.all([
			this.models.printers.getAll(),
			this.models.templates.getAll()
		])
		.then(([printers, templates]) => {
			res.render('profile', {printers, templates, ItemColumns})
		})
	}

	/**
	* Posts an edit for current user
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postRoot(req, res) {
		var passwordValidation = auth.passwordRequirements(req.body.password)
		if (req.body.password && passwordValidation !== true) {
			req.flash('danger', passwordValidation)
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		if (req.body.password && req.body.password != req.body.verify) {
			req.flash('danger', 'Passwords must match')
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		if (!Array.isArray(req.body.itemColumns))
			req.body.itemColumns = [req.body.itemColumns]

		const itemColumns = req.body.itemColumns.filter((i) => Object.keys(ItemColumns).includes(i))

		const user = {
			name: req.body.name,
			email: req.body.email,
			printer_id: req.body.printer ? req.body.printer : null,
			template_id: req.body.template ? req.body.template : null,
			columns: {
				items: itemColumns
			}
		}

		if (req.body.audit_point) {
			user.audit_point = moment(req.body.audit_point, 'HH:mm DD/MM/YYYY').toDate()
		} else {
			user.audit_point = null
		}

		auth.generatePassword(req.body.password)
		.then(password => {
			if (req.body.password) {
				user.pw_hash = password.hash
				user.pw_salt = password.salt
				user.pw_iterations = password.iterations
			}

			this.models.users.update(req.user.id, user)
			.then(id => {
				req.flash('success', 'Profile updated')
				req.saveSessionAndRedirect(this.getRoute())
			})
			.catch(err => this.displayError(req, res, err, this.getRoute()))
		})
	}
}

module.exports = ProfileController
