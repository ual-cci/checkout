const BaseController = require('../../src/js/common/BaseController.js')

const Templates = require('../../src/models/templates.js')

const config = require('./config.json')

class TemplatesController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			templates: new Templates()
		}
	}

	getRoot(req, res) {
		this.models.templates.getAll()
		.then(templates => {
			res.render('index', {templates})
		})
	}

	getCreate(req, res) {
		res.render('create', {template: null})
	}

	postCreate(req, res) {
		if (req.body.name == '') {
			return this.displayError(req, res, '', this.getRoute('/create'), 'The template requires a name')
		}

		const templates = {
			name: req.body.name,
			subject: req.body.subject,
			body: req.body.body
		}

		this.models.templates.create(templates)
		.then(id => {
			req.flash('success', 'Template created')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => this.displayError(req, res, err, this.getRoute(), 'Error creating template - '))
	}

	getSingle(req, res) {
		res.redirect(this.getRoute(`/${req.params.id}/edit`))
	}

	getEdit(req, res) {
		this.models.templates.getById(req.params.id)
		.then(template => {
			if (!template) {
				throw new Error('Could not find template')
			} else {
				res.render('edit', {template})
			}
		})
		.catch(err => this.displayError(req, res, err))
	}

	postEdit(req, res) {
		if (req.body.name == '') {
			return this.displayError(req, res, '', this.getRoute(`/${req.params.id}/edit`), 'The template requires a name')
		}

		const template = {
			name: req.body.name,
			subject: req.body.subject,
			body: req.body.body
		}

		this.models.templates.update(req.params.id, template)
		.then(id => {
			req.flash('success', 'Template updated')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => {
			this.displayError(
				req,
				res,
				err,
				this.getRoute([`/${req.params.id}`, '/edit']),
				'Error updating the template - '
			)
		})
	}

	getRemove(req, res) {
		this.models.templates.getAll()
		.then(templates => {
			const selected = templates.find(i => i.id === parseInt(req.params.id, 10))

			if (!selected) {
				throw new Error('Template not found')
			}

			const list = templates.map(template => {
				if (template.id == req.params.id) {
					return Object.assign({}, template, {
						disabled: true
					})
				}

				return template
			})

			res.render('confirm-remove', {
				selected,
				templates: list
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	postRemove(req, res) {
		let persist = {}

		this.models.templates.getById(req.params.id)
		.then(templateToRemove => {
			if (!templateToRemove) {
				throw new Error('Template not found')
			}

			persist.removeId = templateToRemove.id

			// return this.models.users.updateTemplate(templateToRemove.id, null)
		})
		.then(() => {
			return this.models.templates.remove(persist.removeId)
		})
		.then(() => {
			req.flash('success', 'Template deleted')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => this.displayError(req, res, err, this.getRoute(), 'Error removing template - '))
	}
}

module.exports = TemplatesController
