const BaseController = require('../../src/js/common/BaseController.js')

const Items = require('../../src/models/items.js')
const Groups = require('../../src/models/groups.js')
const Locations = require('../../src/models/locations.js')
const Departments = require('../../src/models/departments.js')
const Courses = require('../../src/models/courses.js')
const Years = require('../../src/models/years.js')
const Printers = require('../../src/models/printers.js')
const Actions = require('../../src/models/actions.js')

// TODO
const Print = require('../../src/js/print')
const {getSortBy} = require('../../src/js/utils.js')
const {AVAILABILITY, ACTIONS, SORTBY_MUTATIONS} = require('../../src/js/common/constants')

const moment = require('moment')

const config = require('./config.json')

class ItemController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			items: new Items(),
			groups: new Groups(),
			locations: new Locations(),
			departments: new Departments(),
			courses: new Courses(),
			years: new Years(),
			printers: new Printers(),
			actions: new Actions(),
		}
	}

	/**
	* Cycles through an array of conditions and if any are matched
	* to redirect with an error
	*
	* @param {Array} checks Object array of shape {message, condition}
	* @param {String} redirect Endpoint to redirect to
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	_checkFields(checks, redirect, req, res) {
		let failed = false
		for (let i = 0; i < checks.length; i++) {
			if (checks[i].condition) {
				this.displayError(req, res, checks[i].message, this.getRoute(redirect))
				failed = true
				break
			}
		}
		return failed
	}

	_getAuditPoint(audited, userAuditPoint = false) {
		switch(audited) {
			case 'auditpoint':
				return userAuditPoint ? moment(userAuditPoint) : moment().startOf('day')
				break
			case 'today':
				return moment().startOf('day').toDate()
				break
			case 'thisweek':
				return moment().startOf('week').toDate()
				break
			case 'thismonth':
				return moment().startOf('month').toDate()
				break
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
		Promise.all([
			this.models.groups.getAll(),
			this.models.locations.getAll(),
			this.models.departments.getAll(),
			this.models.courses.getAll(),
			this.models.years.getAll()
		])
		.then(([groups, locations, departments, courses, years]) => {
			const selected = {
				status: req.query.status ? req.query.status : '',
				location: req.query.location ? req.query.location : '',
				department: req.query.department ? req.query.department : '',
				group: req.query.group ? req.query.group : '',
				course: req.query.course ? req.query.course : '',
				year: req.query.year ? req.query.year : '',
				due: req.query.due ? req.query.due : '',
				audited: req.query.audited ? req.query.audited : '',
				scanned: req.query.scanned ? req.query.scanned : '',
				loanable: req.query.loanable ? req.query.loanable : ''
			}
			const {orderBy, direction} = getSortBy(req.query.sortby, req.query.direction, {
				mutator: SORTBY_MUTATIONS.ITEMS
			})

			// Get items
			this.models.items.query()
			// Section of if commands to add queries into query
			.if((req.query.status), (query) => {
				query.where('status', req.query.status)
			})
			.if((req.query.loanable), (query) => {
				query.where('loanable', (req.query.loanable == 'true' ? true : (req.query.loanable == 'false' ? false : null)))
			})
			.if((req.query.course), query => {
				query.where('courses.id', req.query.course)
			})
			.if((req.query.year), query => {
				query.where('years.id', req.query.year)
			})
			.if((req.query.group), query => {
				query.where('group_id', req.query.group)
			})
			.if((req.query.location), query => {
				query.where('location_id', req.query.location)
			})
			.if((req.query.department), query => {
				query.where('department_id', req.query.department)
			})
			.if((req.query.due), (query) => {
				if (req.query.due == 'overdue') query.where('due', '<=', new Date())
				if (req.query.due == 'future') query.where('due', '>', new Date())
				if (req.query.due == 'today') query.whereBetween('due', [moment().startOf('day').toDate(), moment().endOf('day').toDate()])
				if (req.query.due == 'thisweek') query.whereBetween('due', [moment().startOf('week').toDate(), moment().endOf('week').toDate()])
				if (req.query.due == 'thismonth') query.whereBetween('due', [moment().startOf('month').toDate(), moment().endOf('month').toDate()])
			})
			.if((selected.scanned !== '' || selected.audited !== ''), (query) => {
				if (selected.audited !== '') {
					const audit_point = this._getAuditPoint(req.query.audited, req.user.audit_point)
					let direction = '>='

					if (selected.scanned == 'false') direction = '<'

					query.where(builder => {
						if (selected.scanned == 'false') {
							builder.where('audited', direction, audit_point).orWhere('audited', null)
						} else {
							builder.where('audited', direction, audit_point).whereNot('audited', null)
						}
					})
				} else {
					if (req.query.scanned == 'false') query.where('audited', null)
					if (req.query.scanned == 'true') query.whereNot('audited', null)
				}
			})
			.orderBy([
				[ orderBy, direction ]
			])
			.expose()
			.then(items => {
				res.render('index', {
					items,
					locations,
					departments,
					groups,
					courses,
					years,
					selected,
					sortby: orderBy,
					direction
				})
			})
		})
	}

	/**
	* Endpoint for both displaying and posting data for
	* multi item edit.
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postMultiEdit(req, res) {
		if (!req.body.ids) {
			req.flash('danger', 'At least one item must be selected')
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		let ids = req.body.ids
		if (!Array.isArray(req.body.ids)) {
			ids = req.body.ids.split(',')
		}
		
		// Checks if its a request with data
		if (req.body.fields) {
			const keys = ['name', 'label', 'group', 'location', 'department', 'notes', 'value', 'serialnumber', 'loanable', 'info_url', 'alert_msg']
			const values = ['name', 'label', 'group_id', 'location_id', 'department_id', 'notes', 'value', 'serialnumber', 'loanable', 'info_url', 'alert_msg']
			const item = {}

			keys.forEach((k, index) => {
				if (req.body.fields.indexOf(k) >= 0)
					item[values[index]] = req.body[k]
			})

			this.models.items.updateMultiple(ids, item)
			.then(result => {
				req.flash('success', 'Items updated')
				req.saveSessionAndRedirect(this.getRoute())
			})
			.catch(err => {
				this.displayError(req, res, err, this.getRoute())
			})
		} else {
			Promise.all([
				this.models.groups.getAll(),
				this.models.locations.getAll(),
				this.models.departments.getAll()
			])
			.then(([groups, locations, departments]) => {
				this.models.items.query()
				.orderBy([
					['barcode', 'asc']
				])
				.expose()
				.whereIn('items.id', ids)
				.then(items => {
					res.render('edit-multiple', {
						items,
						groups,
						locations,
						departments
					})
				})
			})
		}
	}

	postMultiRemove(req, res) {
		if (!req.body.ids) {
			req.flash('danger', 'At least one item must be selected')
			req.saveSessionAndRedirect(this.getRoute())
			return;
		}

		const ids = req.body.ids.split(',')

		if (req.body.confirm) {
			if (!req.body.ids) {
				req.flash('danger', 'At least one item must be selected')
				req.saveSessionAndRedirect(this.getRoute())
				return;
			}

			let actions = []
			ids.forEach((id) => {
				actions.push(this.models.actions.removeByItemId(id))
			})
			Promise.all(actions)
				.then(() => {
					this.models.items.removeMultiple(ids)
						.then(result => {
							req.flash('success', 'Items removed')
							req.saveSessionAndRedirect(this.getRoute())
						})
						.catch(err => {
							this.displayError(req, res, err, this.getRoute())
						})
				})
				.catch(err => {
					this.displayError(req, res, err, this.getRoute())
				})
		} else {
			this.models.items.getMultipleByIds(ids)
				.then((items) => {
					const ids = items.map((i) => {
						return i.id
					}).join(',')
					res.render('confirm-multi-remove', {items, ids})
				})
				.catch(err => this.displayError(req, res, err, this.getRoute()))
		}
	}

	/**
	* Get create page with necessary data
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getCreate(req, res) {
		Promise.all([
			this.models.locations.getAll(),
			this.models.departments.getAll(),
			this.models.groups.getAll()
		])
		.then(([locations, departments, groups]) => {
			if (locations.length > 0) {
				res.render('create', {locations: locations, departments: departments, groups: groups, item: {}, template:false})
			} else {
				req.flash('warning', 'Create at least one location before creating items')
				req.saveSessionAndRedirect(this.getRoute())
			}
		})
	}

	/**
	* Gets the item and populates a template create page
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getTemplateItem(req, res) {
		Promise.all([
			this.models.locations.getAll(),
			this.models.departments.getAll(),
			this.models.groups.getAll(),
			this.models.items.getById(req.params.id)
		])
		.then(([locations, departments, groups, item]) => {
			if (!item) {
				throw new Error('Item not found')
			}

			if (locations.length > 0) {
				// Get the first number in the barcode and suggest it as the next item				
				let start = item.barcode.match(/[0-9]+/g)
				if (start != undefined) {
					start = parseInt(start[0])
					if (Number.isInteger(start)) item.start = start + 1
				}

				// Convert numbers in barcode to hashes and suggest it as the barcode generation label
				item.barcode = item.barcode.replaceAll(/[0-9]/g, '#')

				res.render('create', {locations: locations, departments: departments, groups: groups, item: item, template:true})
			} else {
				req.flash('warning', 'Create at least one location before creating items')
				req.saveSessionAndRedirect(this.getRoute())
			}
		})
		.catch(err => {
			this.displayError(req, res, err, `${this.getRoute()}/${req.params.id}`)
		})
	}

	/**
	* Endpoint for posting the generation of items
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postCreate(req, res) {
		const quantity = parseInt(req.body.quantity)
		const start = parseInt(req.body.start)
		const end = (start + quantity) - 1
		const barcode = req.body.barcode.trim()
		const barcodeFilter = barcode.match(/^([\S\s]*?)([#]+)$/)

		const checks = [
			{
				condition: (barcode == ''),
				message: 'The item(s) require a barcode'
			},
			{
				condition: (quantity > 1 && barcodeFilter == null),
				message: 'To generate multiple items the barcode must include # symbol(s) at the end'
			},
			{
				condition: (barcode.includes('#') && quantity < 2),
				message: 'To generate multiple items you must specify how many'
			},
			{
				condition: (req.body.name == ''),
				message: 'The item(s) require a name'
			},
			{
				condition: (quantity > 1 && (start == '' || start < 1)),
				message: 'The item numbering must start at 1 or above'
			},
			{
				condition: (req.body.location == ''),
				message: 'The item(s) must be assigned to a location'
			},
			{
				condition: (quantity > 1 && req.body.serialnumber),
				message: 'You cannot assign the serial number of an item when generating more than 1'
			}
		]

		if (!this._checkFields(checks, '/create', req, res)) {
			const items = []
			const barcodes = []
			let numLen = 2
			if (barcodeFilter) numLen = barcodeFilter[2].length

			this.models.departments.getById(req.body.department)
			.then((department) => {
				for (let i = 0; i < quantity; i++) {
					let x = start + i

					let item = {
						name: req.body.name.trim(),
						barcode: barcode,
						label: req.body.label,
						value: req.body.value,
						location_id: req.body.location,
						department_id: req.body.department,
						info_url: req.body.info_url,
						notes: req.body.notes,
						alert_msg: req.body.alert_msg,
						status: AVAILABILITY.AVAILABLE,
						loanable: (req.body.loanable == 'true' ? true : false)
					}

					if (quantity == 1) {
						item.serialnumber = req.body.serialnumber
					}

					if (!req.body.value) {
						item.value = 0.0
					}

					if (req.body.group) {
						item.group_id = req.body.group
					}

					if (quantity > 1 && barcodeFilter) {
						const index = x.toString().padStart(numLen, '0')
						item.barcode = barcodeFilter[1] + index.toString()
					}

					// Push item into array to be inserted into database
					items.push(item)

					// Push item details into array to be printed
					if (req.body.print) {
						barcodes.push({
							barcode: item.barcode,
							text: item.name,
							type: item.label,
							brand: department.brand
						})
					}
				}
			})
			.then(() => {
				this.models.items.create(items)
				.then(id => {
					req.flash('success', `${items.length} item${items.length > 1 ? 's' : ''} created`)

					if (req.body.print) {
						if (req.user.printer_id) {
							Print.labels(barcodes, req.user.printer_url)
							req.flash('info', `Labels printed to ${req.user.printer_name}`)
						} else {
							req.flash('warning', 'No printer configured')
						}
					}
					if (quantity == 1) {
						req.saveSessionAndRedirect(`${this.getRoute()}/${id[0].id}`)
					} else {
						req.saveSessionAndRedirect(this.getRoute())
					}
				})
				.catch(err => this.displayError(req, res, err, this.getRoute('/create')))
			})
		}
	}

	/**
	* Get import page with necessary data
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getImport(req, res) {
		res.render('import')
	}

	/**
	* Endpoint for processing the import of items
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postImportProcess(req, res) {
		var data
		var format
		if (req.body.format == 'tsv') format = "\t"
		if (req.body.format == 'csv') format = ','

		if (req.body.data) {
			data = req.body.data.trim().split('\r\n')
			data = data.map(d => d.split(format))
		} else {
			req.flash('danger', 'No data provided')
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		Promise.all([
			this.models.locations.getAll(),
			this.models.departments.getAll(),
			this.models.groups.getAll()
		])
		.then(([locations, departments, groups]) => {
			if (locations.length > 0) {
				res.render('process', {locations: locations, departments: departments, groups: groups, data: data})
			} else {
				req.flash('warning', 'Create at least one location before creating items')
				req.saveSessionAndRedirect(this.getRoute())
			}
		})
	}

	/**
	* Endpoint for importing processed item data
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postImportData(req, res) {
		// Test if there are duplicate column headings.
		if (new Set(req.body.cols).size !== req.body.cols.length) {
			req.flash('danger', 'Each heading may only be used once.')
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		// Map heading order
		const expectedHeadings = ['name','value','label','barcode','serialnumber','notes','group','location','department']
		var headingMap = {}
		expectedHeadings.forEach(head => {
			headingMap[head] = req.body.cols.indexOf(head)
		})

		var promises = []
		var _self = this
		function generateItem(data) {
			return new Promise((resolve, reject) => {
				var item = {
					name: data[headingMap.name],
					barcode: data[headingMap.barcode],
					value: parseFloat(data[headingMap.value]),
					notes: data[headingMap.notes],
					serialnumber: data[headingMap.serialnumber],
					status: AVAILABILITY.AVAILABLE
				}

				if (headingMap.label > 0) {
					item.label = data[headingMap.label]
				} else {
					item.label = '12mm'
				}

				if (!item.value) {
					item.value = 0.0
				}

				if (headingMap.group > 0) {
					item.group_id = data[headingMap.group]
				} else if (req.body.group) {
					item.group_id = req.body.group
				}

				if (headingMap.department > 0) {
					item.department_id = data[headingMap.department]
				} else if (req.body.department) {
					item.department_id = req.body.department
				} else {
					throw new Error('No default department was specified and one of more rows were missing a department')
				}

				if (headingMap.location > 0) {
					item.location_id = data[headingMap.location]
				} else if (req.body.location) {
					item.location_id = req.body.location
				} else {
					throw new Error('No default location was specified and one of more rows were missing a location')
				}

				resolve(item)
			})
		}

		// Process data into item objects.
		req.body.items.forEach(data => {
			promises.push(generateItem(data))
		})

		Promise.all(promises)
		.then(items => {
			this.models.items.create(items)
				.then(result => {
					req.flash('success', 'Items imported')
					req.saveSessionAndRedirect(this.getRoute())
				})
				.catch(err => this.displayError(req, res, err, this.getRoute('/import')))
		})
		.catch(err => this.displayError(req, res, err, this.getRoute('/import')))
	}

	/**
	* Gets the item and the associated action history
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getItem(req, res) {
		let _printers
		let _item

		Promise.all([
			this.models.printers.getAll(),
			this.models.items.getById(req.params.id)
		])
		.then(([printers, item]) => {
			if (!item) {
				throw new Error('Item not found')
			}

			_printers = printers
			_item = item

			return this.models.actions.getByItemId(item.id)
		})
		.then(history => {
			res.render('single', {
				item: _item,
				printers: _printers,
				history
			})
		})
		.catch(err => {
			this.displayError(req, res, err, this.getRoute())
		})
	}

	/**
	* Gets a label for a given item and prints it
	* using either the specified printer or the
	* user's printer
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getLabel(req, res) {
		let _item
		this.models.items.getById(req.params.id)
		.then(item => {
			if (!item) {
				throw new Error('Item not found')
			}

			_item = item

			const printerId = req.query.printer || req.user.printer_id

			if (!printerId) {
				throw new Error('No printer selected')
			}

			return this.models.printers.getById(printerId)
		})
		.then(printer => {
			if (!printer) {
				throw new Error('Invalid printer')
			}

			Print.label({
				barcode: _item.barcode,
				text: _item.name,
				type: _item.label,
				brand: _item.department_brand
			}, printer.url)

			req.flash('info', `Label printed to ${printer.name}`)
			if (req.get('referer') && req.get('referer').indexOf(`items/${req.params.id}`) < 0) {
				req.saveSessionAndRedirect(this.getRoute())
			} else {
				req.saveSessionAndRedirect(this.getRoute(`/${_item.id.toString()}`))
			}
		})
		.catch(err => {
			this.displayError(req, res, err, this.getRoute())
		})
	}

	/**
	* Prints multiple labels at once
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getMultiPrint(req, res) {
		if (req.user.printer_id) {
			this.models.items.getMultipleByIds(req.body.ids.split(','))
				.then(items => {
					const barcodes = items.map(item => {
						return {
							barcode: item.barcode,
							text: item.name,
							type: item.label,
							brand: item.department_brand
						}
					})

					Print.labels(barcodes, req.user.printer_url)

					req.flash('success', `Printed those labels to ${req.user.printer_name}`)
					req.saveSessionAndRedirect(this.getRoute())
				})
				.catch(err => this.displayError(req, res, err, this.getRoute()))
		} else {
			req.flash('warning', 'No printer configured')
			req.saveSessionAndRedirect(this.getRoute())
		}
	}

	/**
	* Gets the edit page for a given item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getEdit(req, res) {
		Promise.all([
			this.models.items.getById(req.params.id),
			this.models.groups.getAll(),
			this.models.locations.getAll(),
			this.models.departments.getAll()
		])
		.then(([item, groups, locations, departments]) => {
			if (!item) {
				throw new Error('Item not found')
			}

			res.render('edit', {
				item,
				groups,
				locations,
				departments
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	* Posts the edits made to an item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postEdit(req, res) {
		const item = {
			name: req.body.name,
			barcode: req.body.barcode,
			label: req.body.label,
			location_id: req.body.location,
			value: req.body.value,
			notes: req.body.notes,
			alert_msg: req.body.alert_msg,
			serialnumber: req.body.serialnumber,
			info_url: req.body.info_url,
			loanable: (req.body.loanable == 'true' ? true : false)
		}

		if (!req.body.value) {
			item.value = 0.0
		}

		if (req.body.group != '') {
			item.group_id = req.body.group
		}

		if (req.body.department != '') {
			item.department_id = req.body.department
		}

		this.models.items.update(req.params.id, item)
		.then(result => {
			req.flash('success', 'Item updated')

			if (req.body.print) {
				if (req.user.printer_id) {
					this.models.items.getById(req.params.id)
						.then(item => {
							Print.label({
								barcode: item.barcode,
								text: item.name,
								type: item.label,
								brand: item.department_brand
							}, req.user.printer_url)
							req.flash('info', `Label reprinted to ${req.user.printer_name}`)
						})
				} else {
					req.flash('warning', 'No printer configured')
				}
			}

			req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`))
		})
		.catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)))
	}

	/**
	* Gets the remove page for an item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getRemove(req, res) {
		this.models.items.getById(req.params.id)
		.then(item => {
			if (!item) {
				throw new Error('Item not found')
			}

			res.render('confirm-remove', {
				selected: item
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	* Endpoint for removing an item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postRemove(req, res) {
		let _item
		this.models.items.getById(req.params.id)
		.then(item => {
			if (!item) {
				throw new Error('Item not found')
			}

			_item = item

			return this.models.actions.removeByItemId(item.id)
		})
		.then(() => {
			return this.models.items.remove(_item.id)
		})
		.then(() => {
			req.flash('success', "Item and it's history removed")
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	* Endpoint for marking an item lost
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getLost(req, res) {
		let _item
		this.models.items.getById(req.params.id)
		.then(item => {
			if (!item) {
				throw new Error('Item not found')
			}

			_item = item

			return this.models.actions.create({
				item_id: _item.id,
				action: ACTIONS.LOST,
				user_id: item.owner_id ? item.owner_id : null,
				operator_id: req.user.id
			})
		})
		.then(() => {
			return this.models.items.lost(_item.barcode)
		})
		.then(() => {
			req.flash('success', "Item marked as lost")
			if (req.query.returnTo == 'user') {
				req.saveSessionAndRedirect(`/users/${_item.owner_id}`)
			} else {
				req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`))
			}
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	* Endpoint for marking an item broken
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getBroken(req, res) {
		let _item
		this.models.items.getById(req.params.id)
		.then(item => {
			if (!item) {
				throw new Error('Item not found')
			}

			_item = item

			return this.models.actions.create({
				item_id: _item.id,
				action: ACTIONS.BROKEN,
				user_id: item.owner_id ? item.owner_id : null,
				operator_id: req.user.id
			})
		})
		.then(() => {
			return this.models.items.broken(_item.barcode)
		})
		.then(() => {
			req.flash('success', "Item marked as broken")
			if (req.query.returnTo == 'user') {
				req.saveSessionAndRedirect(`/users/${_item.owner_id}`)
			} else {
				req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`))
			}
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	* Endpoint for marking an item sold
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getSold(req, res) {
		let _item
		this.models.items.getById(req.params.id)
		.then(item => {
			if (!item) {
				throw new Error('Item not found')
			}

			_item = item

			return this.models.actions.create({
				item_id: _item.id,
				action: ACTIONS.SOLD,
				user_id: item.owner_id ? item.owner_id : null,
				operator_id: req.user.id
			})
		})
		.then(() => {
			return this.models.items.sold(_item.barcode)
		})
		.then(() => {
			req.flash('success', "Item marked as sold")
			if (req.query.returnTo == 'user') {
				req.saveSessionAndRedirect(`/users/${_item.owner_id}`)
			} else {
				req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`))
			}
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	* Endpoint for returning an item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getReturn(req, res) {
		let _item
		this.models.items.getById(req.params.id)
		.then(item => {
			if (!item) {
				throw new Error('Item not found')
			}

			_item = item

			let action = ACTIONS.RETURNED
			switch (item.status) {
				case AVAILABILITY.BROKEN:
					action = ACTIONS.REPAIRED
					break
				case AVAILABILITY.LOST:
					action = ACTIONS.FOUND
					break
				case AVAILABILITY.SOLD:
					action = ACTIONS.REPLACED
					break
			}

			return this.models.actions.create({
				item_id: _item.id,
				action,
				user_id: item.owner_id ? item.owner_id : null,
				operator_id: req.user.id
			})
		})
		.then(() => {
			return this.models.items.return(_item.barcode)
		})
		.then(() => {
			req.flash('success', "Item returned")
			if (req.query.returnTo == 'user') {
				req.saveSessionAndRedirect(`/users/${_item.owner_id}`)
			} else {
				req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`))
			}
			
			
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}
}

module.exports = ItemController
