//
const path = require('path')
const moment = require('moment')
const pug = require('pug')

const BaseController = require('../../src/js/common/BaseController.js')
const {AVAILABILITY, ACTIONS} = require('../../src/js/common/constants')
const auth = require('../../src/js/authentication')
const config = require('./config.json')

const Items = require('../../src/models/items.js')
const Locations = require('../../src/models/locations.js')
const Groups = require('../../src/models/groups.js')
const Users = require('../../src/models/users.js')
const Actions = require('../../src/models/actions.js')
const Courses = require('../../src/models/courses.js')
const Years = require('../../src/models/years.js')
const Departments = require('../../src/models/departments.js')
const Printers = require('../../src/models/printers.js')

const Print = require('../../src/js/print')

class ApiController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			locations: new Locations(),
			groups: new Groups(),
			items: new Items(),
			users: new Users(),
			actions: new Actions(),
			courses: new Courses(),
			years: new Years(),
			departments: new Departments(),
			printers: new Printers(),
		}
	}

	/**
	* Search end point that searches various fields
	* by barcode and name
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getSearch(req, res) {
		const {term} = req.params
		Promise.all([
			this.models.users.search(term),
			this.models.items.search(term),
			this.models.groups.search(term),
			this.models.locations.search(term),
			this.models.departments.search(term),
			this.models.courses.search(term),
			this.models.years.search(term)
		])
		.then(([users, items, groups, locations, departments, courses, years]) => {
			let result = {}

			if (auth.userCan(req.user, 'items_read'))
				result.items = items
			if (auth.userCan(req.user, 'users_read'))
				result.users = users
			if (auth.userCan(req.user, 'groups_read'))
				result.groups = groups
			if (auth.userCan(req.user, 'courses_read'))
				result.courses = courses
			if (auth.userCan(req.user, 'years_read'))
				result.years = years
			if (auth.userCan(req.user, 'locations_read'))
				result.locations = locations
			if (auth.userCan(req.user, 'departments_read'))
				result.departments = departments

			res.json(result)
		})
	}

	/**
	* Find end point that searches both users
	* and items by barcode and name
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getFind(req, res) {
		const {term} = req.params
		Promise.all([
			this.models.users.search(term),
			this.models.items.search(term)
		])
		.then(([users, items]) => {
			res.json({
				query: term,
				users,
				items
			})
		})
	}

	/**
	* Returns the type of object that is found
	* when searching a barcode
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getIdentify(req, res) {
		Promise.all([
			this.models.users.getByBarcode(req.params.term),
			this.models.items.getByBarcode(req.params.term)
		])
		.then(([user, item]) => {
			if (user) {
				return {
					kind: 'user',
					barcode: user.barcode
				}
			}

			if (item) {
				return {
					kind: 'item',
					barcode: item.barcode
				}
			}

			return {
				kind: 'unknown'
			}
		})
		.then(result => {
			res.json(result)
		})
	}

	/**
	* Lookups a user by barcode.
	* Attaches the items that are associated to the user
	* if found
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getUser(req, res) {
		let persist

		this.models.users.query()
		.lookup(['course', 'year'])
		.getByBarcode(req.params.barcode)
		.then(user => {
			if (!user) {
				throw ({
					message: 'Unknown user'
				})
			}

			persist = {
				...persist,
				user
			}

			return this.models.items.getOnLoanByUserId(user.id)
		})
		.then(items => {
			const {user} = persist

			const html = pug.renderFile(path.join(__dirname, '../../src/views/modules/user.pug'), {
				user,
				currentUserCan: function(perm) {
					return auth.userCan(req.user, perm)
				},
				onloan: items,
				moment: moment
			})

			const output = {
				type: 'user',
				id: user.id,
				barcode: user.barcode,
				name: user.name,
				email: user.email,
				course: user.course,
				html: html
			}

			return res.json(output)
		})
		.catch(err => this.displayErrorJson(req, res, err))
 }

	/**
	* Gets the item by barcode and returns the
	* rendered html partial
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getItem(req, res) {
		this.models.items.getByBarcode(req.params.barcode)
		.then(item => {
			if (!item) {
				throw ({
					message: 'Unknown item',
					barcode: req.params.barcode
				})
			}

			const html = pug.renderFile(path.join(__dirname, '../../src/views/modules/item.pug'), {
				item,
				moment,
				currentUserCan: function(perm) {
					return auth.userCan(req.user, perm)
				}
			})

			const output = {
				type: 'item',
				id: item.id,
				barcode: item.barcode,
				location: item.location_id,
				group: item.group_id,
				status: item.status,
				owner_id: item.owner_id,
				html: html
			}

			return res.json(output)
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Creates an audit for an item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postAudit(req, res) {
		let persist = {}
		// this.models.items.audit(req.params.item)
		this.models.items.getByBarcode(req.params.item)
		.then(item => {
			if (!item) {
				throw ({
					message: 'Unknown item',
					barcode: req.params.item
				})
			}

			persist.item = item

			if (req.body.location) {
				return this.models.locations.getById(req.body.location)
			}

			return false
		})
		.then(location => {
			const {item} = persist
			const match = req.body.location == item.location_id

			if (location) {
				if (match) {
					// location set, but matches
					return 1
			 } else if (!match && req.body.override == 'true') {
					// location set, doesn't match but updated
					this.models.items.update(item.id, {
						location_id: location.id
				 })
					return 2
			 } else {
					throw ({
						message: `Item is in the wrong location, should be: <strong>${item.location_name}</strong>`,
						barcode: item.barcode
					})
				}
			} else {
				// just audit
				return 1
			}
		})
		.then(result => {
			const {item} = persist

			if (result > 0) {
				this.models.items.audit(item.barcode)
				this.models.actions.create({
					item_id: item.id,
					action: ACTIONS.AUDITED,
					operator_id: req.user.id
				})
			}

			return result
		})
		.then(result => {
			const {item} = persist

			switch (result) {
				case 1:
					res.json({
						status: 'success',
						message: 'Successfully audited',
						barcode: item.barcode
					})
					break
				case 2:
					res.json({
						status: 'success',
						message: 'Successfully audited and moved to new location',
						barcode: item.barcode
					})
					break
			}
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Sets an item as returned and logs an action
	* noting the capacity in which it was returned.
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postReturn(req, res) {
		let persist = {}
		this.models.items.return(req.params.item)
		.then(item => {
			persist.item = item

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
				item_id: item.id,
				action,
				user_id: item.owner_id ? item.owner_id : null,
				operator_id: req.user.id
			})
		})
		.then(() => {
			const {item} = persist
			return res.json({
				status: 'success',
				message: 'Successfully returned',
				barcode: item.barcode
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Marks an item as broken and logs an action
	* noting that
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postBroken(req, res) {
		let persist = {}
		this.models.items.broken(req.params.item)
		.then(item => {
			persist.item = item

			return this.models.actions.create({
				item_id: item.id,
				action: ACTIONS.BROKEN,
				operator_id: req.user.id
			})
		})
		.then(() => {
			const {item} = persist

			return res.json({
				status: 'success',
				message: 'Successfully marked as broken',
				barcode: item.barcode
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Marks an item as lost and logs an action
	* nothing that
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postLost(req, res) {
		let persist = {}
		this.models.items.lost(req.params.item)
		.then(item => {
			persist.item = item

			return this.models.actions.create({
				item_id: item.id,
				action: ACTIONS.LOST,
				operator_id: req.user.id
			})
		})
		.then(() => {
			const {item} = persist

			return res.json({
				status: 'success',
				message: 'Successfully marked as lost',
				barcode: item.barcode
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Marks an item as sold and logs an action
	* nothing that
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postSold(req, res) {
		let persist = {}
		this.models.items.sold(req.params.item)
		.then(item => {
			persist.item = item

			return this.models.actions.create({
				item_id: item.id,
				action: ACTIONS.SOLD,
				operator_id: req.user.id
			})
		})
		.then(() => {
			const {item} = persist

			return res.json({
				status: 'success',
				message: 'Successfully marked as sold',
				barcode: item.barcode
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Issues out an item to a user and logs an
	* action noting that
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postIssue(req, res) {
		// First grab both user and item by barcodes
		Promise.all([
			this.models.users.getByBarcode(req.params.user),
			this.models.items.getByBarcode(req.params.item)
		])
		.then(([user, item]) => {
			if (!user) {
				throw ({message: 'Unknown user', barcode: req.params.user})
			}

			if (user.disable) {
				throw ({message: 'User account has been disabled', barcode: user.barcode})
			}

			if (!item) {
				throw ({message: 'Unknown item', barcode: req.params.item})
			}

			if (!item.loanable) {
				throw ({message: 'Item is not loanable', barcode: req.params.item})
			}

			switch (item.status) {
				case AVAILABILITY.ON_LOAN:
					throw ({message: 'Item already on loan', barcode: item.barcode})
				case AVAILABILITY.LOST:
					throw ({message: 'Item is currently lost', barcode: item.barcode})
				case AVAILABILITY.BROKEN:
					throw ({message: 'Item is currently broken', barcode: item.barcode})
			}

			return {user, item}
		})
		.then(({user, item}) => {
			const result = {user, item}

			// Checks if item is part of group and has a limiter
			if (item.group_id && item.group_limiter) {
				// Sees if the item count has been exceed for this user
				return this.models.items.query()
					.where([
						['owner_id', user.id],
						['group_id', item.group_id]
					])
					.expose()
					.then(items => {
						const count = items.length

						if (count >= item.group_limiter && !req.query.override) {
							result.count = count
						}

						if (req.query.override && ! auth.userCan(req.user, 'groups_override')) {
							throw ({
								message: 'You are not authorised to override the group item limit.',
							})
						}

						return result
					})
			} else {
				return result
			}
		})
		.then(({user, item ,count}) => {
			// If the count has been marked as an issue, display that to the user
			if (count) {
				throw ({
					message: `User already has ${count} of this type of item out`,
					override: auth.userCan(req.user, 'groups_override'),
					barcode: item.barcode
				})
			}

			// Create due date
			var dueDate
			if (item.group_duration) {
				var duration = moment.duration(item.group_duration.toISO())
				dueDate = moment().add(duration)
			}

			// Issue the item to the user and log an action
			return Promise.all([
				this.models.items.issue(item.id, user.id, req.user, dueDate),
				this.models.actions.create({
					item_id: item.id,
					user_id: user.id,
					action: ACTIONS.ISSUED,
					operator_id: req.user.id
				})
			])
		})
		.then(([id, actionId]) => {
			res.json({
				message: 'Item issued',
				status: 'success'
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Change the current users selected printer
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getSelectLabel(req, res) {
		this.models.printers.getById(req.params.id)
		.then(printer => {
			if (!printer) {
				throw ({
					message: 'Unknown printer'
				})
			}
			this.models.users.update(res.locals.loggedInUser.id, {printer_id: printer.id})
			.then((result) => {
				res.json({
					status: 'success',
					printer: printer.label
				})
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Attempts to print a label for any given item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postLabel(req, res) {
		this.models.items.getByBarcode(req.params.item)
		.then(item => {
			if (!item) {
				throw ({
					message: 'Unknown item',
					barcode: req.params.item
				})
			}

			if (!req.user.printer_id) {
				throw ({
					message: 'You have not assigned a printer in your profile',
					barcode: item.barcode
				})
			}

			Print.label({
				barcode: item.barcode,
				text: item.name,
				type: item.label,
				brand: item.department_brand
			}, req.user.printer_url)

			return res.json({
				status: 'success',
				message: `Label printed to ${req.user.printer_name}`,
				barcode: item.barcode
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	* Endpoint to create a new user
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postNewUser(req, res) {
		const cachedError = (err) => {
			return this.displayErrorJson(req, res, err)
		}

		if (!req.body.name) {
			return cachedError('The user must have a name')
		}

		if (!req.body.barcode) {
			return cachedError('The user must have a unique barcode')
		}

		if (!req.body.email) {
			return cachedError('The user must have an email address')
		}

		if (!req.body.course) {
			return cachedError('User must be attached to a course')
		}

		if (!req.body.year) {
			return cachedError('User must be attached to a year')
		}

		Promise.all([
			this.models.courses.getById(req.body.course),
			this.models.years.getById(req.body.year)
		])
		.then(([course, year]) => {
			if (!course) {
				throw new Error('The user must be assigned to a course')
			}

			if (!year) {
				throw new Error('The user must be assigned to a year')
			}

			const user = {
				name: req.body.name,
				barcode: req.body.barcode,
				email: req.body.email,
				course_id: course.id,
				year_id: year.id
			}

			return this.models.users.create(user)
				.catch(err => {
					throw ({
						message: err.message,
						redirect: {
							type: 'user',
							barcode: req.body.barcode
						}
					})
				})
		})
		.then(id => {
			return res.json({
				status: 'success',
				message: 'User created',
				redirect: {
					type: 'user',
					barcode: req.body.barcode
				}
			})
		})
		.catch(err => this.displayErrorJson(req, res, err))
	}

	/**
	 * Gets the actions for the current day
	 *
	 * @param {Object} req Express request object
	 * @param {Object} res Express response object
	 */
	getHistory(req, res) {
		this.models.actions.getDateRange(
			moment().startOf('day'),
			moment().endOf('day')
		)
		.then(actions => {
			const html = pug.renderFile(path.join(__dirname, '../../src/views/modules/history.pug'), {
				actions,
				moment,
				currentUserCan: function(perm) {
					return auth.userCan(req.user, perm)
				},
			})

			res.json({
				actions: html
			})
		})
	}
}

module.exports = ApiController
