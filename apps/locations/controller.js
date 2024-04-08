const BaseController = require('../../src/js/common/BaseController.js')

const Locations = require('../../src/models/locations.js')
const Items = require('../../src/models/items.js')
const Printers = require('../../src/models/printers.js')

const Queue = require('../../src/js/queue.js')()

const config = require('./config.json')

class LocationController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			locations: new Locations(),
			items: new Items(),
			printers: new Printers()
		}
	}

	getRoot(req, res) {
		this.models.locations.getAll()
		.then(locations => {
			res.render('index', {locations})
		})
	}

	getCreate(req, res) {
		res.render('create', {location: {}})
	}

	postCreate(req, res) {
		if (req.body.name == '') {
			return this.displayError(req, res, 'The location requires a name', this.getRoute('/create'), 'Error creating - ')
		}

		var location = {
			name: req.body.name
		}

		if (req.body.barcode) {
			location.barcode = req.body.barcode
		} else {
			location.barcode = null
		}

		this.models.locations.create(location)
		.then(result => {
			req.flash('success', 'Location created')
			req.saveSessionAndRedirect(this.mountPath)
		})
		.catch(err => this.displayError(req, res, err, this.getRoute('/create'), 'Location not created - '))
	}

	getSingle(req, res) {
		res.redirect(this.getRoute(`/${req.params.id}/edit`))
	}

	getEdit(req, res) {
		this.models.locations.getById(req.params.id)
		.then(location => {
			if (!location) {
				throw new Error('Location not found')
			}

			res.render('edit', {location})
		})
		.catch(err => this.displayError(req, res, err, this,getRoute()))
	}

	postEdit(req, res) {
		if (req.body.name == '') {
			return this.displayError(req, res, 'The location requires a name', this.getRoute([`/${req.params.id}`, '/edit']), 'Error editing - ')
		}

		var location = {
			name: req.body.name
		}

		if (req.body.barcode) {
			location.barcode = req.body.barcode
		} else {
			location.barcode = null
		}

		this.models.locations.update(req.params.id, location)
		.then(() => {
			req.flash('success', 'Location updated')
			req.saveSessionAndRedirect(this.mountPath)
		})
		.catch(err => this.displayError(req, res, err, this.getRoute([`/${req.params.id}`, '/edit']), 'Location not updated - '))
	}

	getRemove(req, res) {
		this.models.locations.getAll()
		.then(locations => {
			const selected = locations.find(d => d.id === parseInt(req.params.id, 10))

			if (!selected) {
				throw new Error('locations not found')
			}

			const list = locations.map(location => {
				if (location.id == req.params.id) {
					return Object.assign({}, location, {
						disabled: true
					})
				}

				return location
			})

			res.render('confirm-remove', {
				selected: selected,
				locations: list
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	 * Endpoint for removing a location and transferring
	 * all items to a new location
	 *
	 * @param {Object} req Express request object
	 * @param {Object} res Express response object
	 */
	postRemove(req, res) {
		let removeId

		Promise.all([
			this.models.locations.query().getById(req.params.id),
			this.models.locations.query().getById(req.body.location)
		])
		.then(([ locationToRemove, locationToBecome ]) => {
			if (!locationToBecome || !locationToRemove) {
				throw new Error('Location to remove/become not found')
			}

			removeId = locationToRemove.id
			return {locationToRemove, locationToBecome}
		})
		.then(({locationToRemove, locationToBecome}) => {
			return this.models.items.updateLocation(locationToRemove.id, locationToBecome.id)
		})
		.then(() => {
			return this.models.locations.remove(removeId)
		})
		.then(() => {
			req.flash('success', 'Location deleted and items transferred')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => {
			this.displayError(req, res, err, this.getRoute(), 'Error removing post - ')
		})
	}


	getLabel(req, res) {
		let persist = {}

		this.models.locations.getById(req.params.id)
		.then(location => {
			if (!location) {
				throw new Error('Location not found')
			}

			persist.location = location
			persist.printerId = req.query.printer || req.user.printer_id

			if (!persist.printerId) {
				throw new Error('No printer selected')
			}

			return this.models.printers.getById(persist.printerId)
		})
		.then(printer => {
			const {location} = persist

			if (!printer) {
				throw new Error('Invalid printer')
			}

			Queue.task('Labels', {
				printer_id: printer.id,
				barcode: 'L:' + location.barcode,
				text: location.barcode,
				type: '36mm',
				source: 'Location - getLabel',
				user: req.user.name
			})

			req.flash('info', `Label queued to print on ${printer.name}`)
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}
}

module.exports = LocationController
