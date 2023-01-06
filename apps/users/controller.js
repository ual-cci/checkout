const pug = require('pug')

const config = require('./config.json')
const BaseController = require('../../src/js/common/BaseController.js')
const auth = require('../../src/js/authentication')

const Options = require('../../src/js/options')()
const Mail = require('../../src/js/mail')()

const Courses = require('../../src/models/courses')
const Users = require('../../src/models/users')
const Years = require('../../src/models/years')
const Items = require('../../src/models/items')
const Actions = require('../../src/models/actions')
const Printers = require('../../src/models/printers')
const Roles = require('../../src/models/roles')

const {getSortBy} = require('../../src/js/utils.js')
const {STATUS, SORTBY_MUTATIONS} = require('../../src/js/common/constants')

class UsersController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			users: new Users(),
			courses: new Courses(),
			years: new Years(),
			items: new Items(),
			actions: new Actions(),
			printers: new Printers(),
			roles: new Roles(),
		}
	}

	getRoot(req, res) {
		let persist = {}

		Promise.all([
			this.models.roles.getAll(),
			this.models.courses.getAll(),
			this.models.years.getAll()
		])
		.then(([roles, courses, years]) => {
			const {orderBy, direction} = getSortBy(req.query.sortby, req.query.direction, {
				validSorts: ['name', 'role', 'course', 'year', 'barcode'],
				defaultSortby: 'name',
				mutator: SORTBY_MUTATIONS.USERS
			})

			persist = {
				...persist,
				roles,
				courses,
				years,
				orderBy,
				direction
			}

			return this.models.users.query()
				.lookup(['year', 'role', 'course', 'contact', 'printer'])
				.if((req.query.status), (query) => {
					let status

					switch (req.query.status) {
						case STATUS.ACTIVE:
							status = false
							break
						case STATUS.DISABLED:
							status = true
							break
					}
					query.where('users.disable', status)
				})
				.if((req.query.role), (query) => {
					query.where('users.role_id', req.query.role)
				})
				.if((req.query.course), (query) => {
					query.where('users.course_id', req.query.course)
				})
				.if((req.query.year), (query) => {
					query.where('users.year_id', req.query.year)
				})
				.orderBy([
					[orderBy, direction]
				])
				.expose()
		})
		.then(users => {
			const {roles, courses, years, orderBy, direction} = persist

			res.render('index', {
				users,
				courses,
				years,
				roles,
				selected: {
					status: req.query.status ? req.query.status : '',
					course: req.query.course ? req.query.course : '',
					role: req.query.role ? req.query.role : '',
					year: req.query.year ? req.query.year : ''
				},
				sortby: req.query.sortby ? req.query.sortby : 'name',
				direction: req.query.direction ? req.query.direction : 'asc'
			})
		})
	}

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

		if (ids.includes(req.user.id.toString())) {
			return this.displayError(req, res, 'You cannot edit the logged in user.', this.getRoute())
		}

		if (req.body.fields) {
			const keys = ['course', 'year', 'role','status']
			const values = ['course_id', 'year_id', 'role_id','disable']
			const user = {}

			keys.forEach((k, index) => {
				if (req.body.fields.indexOf(k) >= 0 && req.body[k])
					user[values[index]] = req.body[k]
			})

			if ('disable' in user) {
				user.disable = user.disable == 'disabled' ? true : false
			}

			this.models.users.updateMultiple(ids, user)
			.then(() => {
				req.flash('success', 'User updated')
				req.saveSessionAndRedirect(this.getRoute())
			})
			.catch(err => this.displayError(req, res, err, this.getRoute()))
		} else {		
			let persist = {}

			Promise.all([
				this.models.years.getAll(),
				this.models.courses.getAll(),
				this.models.roles.getAll()
			])
			.then(([years, courses, roles]) => {
				persist = {
					...persist,
					years,
					courses,
					roles
				}

				var query = this.models.users.query()
					.getMultipleByIds(ids)

				var q2 = this.models.users.rewrap(query)
				q2.lookup(['course', 'year', 'role'])
					.orderBy([
						['barcode', 'asc']
					])

				return q2.retrieve()
			})
			.then(users => {
				const {years, courses, roles} = persist

				res.render('edit-multiple', {
					users,
					courses,
					years,
					roles
				})
			})
			.catch(err => this.displayError(req, res, err, this.getRoute()))
		}
	}

	postMultiRemove(req, res) {
		const ids = req.body.ids.split(',')

		if (ids.includes(req.user.id.toString())) {
			return this.displayError(req, res, 'You cannot delete the logged in user.', this.getRoute())
		}

		if (!req.body.ids) {
			return this.displayError(req, res, 'At least one user must be selected.', this.getRoute())
		}

		
		if (req.body.confirm) {
			let userLoans = []
			ids.forEach((id) => {
				userLoans.push(this.models.items.getOnLoanByUserId(id))
			})
			Promise.all(userLoans)
				.then((items) => {
					items.forEach(items => {
						if (items.length) {
							throw new Error('Users cannot be deleted if they have items on loan to them')
						}
					})

					let actions = []
					ids.forEach((id) => {
						actions.push(this.models.actions.removeByUserId(id))
					})
					Promise.all(actions)
						.then(() => {
							this.models.users.removeMultiple(ids)
								.then(result => {
									req.flash('success', 'Users removed')
									req.saveSessionAndRedirect(this.getRoute())
								})
								.catch(err => {
									this.displayError(req, res, err, this.getRoute())
								})
						})
						.catch(err => {
							this.displayError(req, res, err, this.getRoute())
						})
				})
				.catch(err => {
					this.displayError(req, res, err, this.getRoute())
				})
		} else {
			this.models.users.getMultipleByIds(ids)
				.then((users) => {
					const ids = users.map((i) => {
						return i.id
					}).join(',')
					res.render('confirm-multi-remove', {users, ids})
				})
				.catch(err => this.displayError(req, res, err, this.getRoute()))
		}
	}

	getUser(req, res) {
		let persist = {}
		this.models.users.query()
		.lookup(['printer', 'role', 'course', 'year', 'contact'])
		.where([['id', req.params.id]])
		.retrieveSingle()
		.then(user => {
			if (!user) {
				throw new Error('User not found')
			}

			persist = {
				...persist,
				user
			}

			return Promise.all([
				this.models.items.getOnLoanByUserId(req.params.id),
				this.models.actions.getByUserId(req.params.id)
			])
		})
		.then(([items, actions]) => {
			const {user} = persist
			res.render('single', {
				user,
				onloan: items,
				history: actions
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	getUserEdit(req, res) {
		let persist = {}

		this.models.users.query()
		.lookup(['printer', 'course', 'year'])
		.where([['id', req.params.id]])
		.retrieveSingle()
		.then(user => {
			if (!user) {
				throw new Error('User not found')
			}

			persist = {
				...persist,
				user
			}

			return Promise.all([
				this.models.printers.getAll(),
				this.models.years.getAll(),
				this.models.courses.getAll(),
				this.models.roles.getAll()
			])
		})
		.then(([printers, years, courses, roles]) => {
			const {user} = persist

			res.render('edit', {
				courses,
				years,
				user,
				printers,
				roles
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	postUserEdit(req, res) {
		const user = {
			name: req.body.name,
			barcode: req.body.barcode,
			email: req.body.email,
			course_id: req.body.course,
			year_id: req.body.year,
			printer_id: req.body.printer ? req.body.printer : null,
			disable: req.body.disable ? true : false
		}

		if (req.body.audit_point) {
			user.audit_point = new Date(req.body.audit_point)
		} else {
			user.audit_point = null
		}

		if (req.body.role != undefined) {
			if (auth.userCan(req.user, 'users_change_role')) {
				if (req.body.role) {
					user.role_id = req.body.role
				} else {
					user.role_id = null
				}
			} else {
				req.flash('warning', 'You do not have permission to change another role.')
			}
		}

		auth.generatePassword(req.body.password?req.body.password:'').then(password => {
			if (req.body.password) {
				if (auth.userCan(req.user, 'users_change_password')) {
					user.pw_hash = password.hash
					user.pw_salt = password.salt
					user.pw_iterations = password.iterations
				} else {
					req.flash('warning', 'You do not have permission to change another users password.')
				}
			}

			this.models.users.update(req.params.id, user)
			.then(id => {
				req.flash('success', 'User updated')
				req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`))
			})
			.catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)))
		})
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
	* Endpoint for processing the import of users
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
			this.models.courses.getAll(),
			this.models.years.getAll(),
			this.models.roles.getAll()
		])
		.then(([courses, years, roles]) => {
			res.render('process', {courses: courses, years: years, roles: roles, data: data})
		})
	}

	/**
	* Endpoint for importing processed user data
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postImportData(req, res) {
		// Test if there are duplicate column headings, after removing ignored columns
		const filteredCols = req.body.cols.filter(n => n)

		if (new Set(filteredCols).size !== filteredCols.length) {
			req.flash('danger', 'Each heading may only be used once.')
			req.saveSessionAndRedirect(this.getRoute())
			return
		}

		// Map heading order
		const expectedHeadings = ['name','barcode','email','course','year','role','password']
		var headingMap = {}
		expectedHeadings.forEach(head => {
			headingMap[head] = req.body.cols.indexOf(head)
		})

		const promises = []
		const errors = []

		const generateUser = (data) => {

			return new Promise((resolve, reject) => {
				var user = {
					name: data[headingMap.name],
					barcode: data[headingMap.barcode],
					email: data[headingMap.email]
				}

				if (data[headingMap.role] > 0) {
					user.role_id = parseInt(data[headingMap.role])
				} else if (req.body.role) {
					user.role_id = parseInt(req.body.role)
				} else {
					// students don't need roles
					user.role_id = null
				}

				if (data[headingMap.course] > 0) {
					user.course_id = parseInt(data[headingMap.course])
				} else if (req.body.course) {
					user.course_id = parseInt(req.body.course)
				} else {
					errors.push('No default course was specified and one of more rows were missing a course')
					reject(user)
				}

				if (data[headingMap.year] > 0) {
					user.year_id = parseInt(data[headingMap.year])
				} else if (req.body.year) {
					user.year_id = parseInt(req.body.year)
				} else {
					errors.push('No default year was specified and one of more rows were missing a year')
					reject(user)
				}

				if (headingMap.password > 0) {
					auth.generatePassword(data[headingMap.password], function(password) {
						user.pw_salt = password.salt,
						user.pw_hash = password.hash,
						user.pw_iterations = password.iterations
						resolve(user)
					})
				} else {
					resolve(user)
				}
			}).catch(err => console.log(err))
		}

		req.body.users.forEach(data => {
			promises.push(generateUser(data))
		})

		Promise.all(promises)
		.then(users => {
			if (errors.length === 0 ) {
				this.models.users.create(users)
					.then(result => {
						req.flash('success', 'Users imported')
						req.saveSessionAndRedirect(this.getRoute())
					}).catch(err => this.displayError(req, res, err, this.getRoute('/import')))
				}

			else {
				const errList =  [...new Set(errors)]
				errList.forEach(error => req.flash('danger', error))
				req.saveSessionAndRedirect(this.getRoute('/import'))
			}
		})
	}

	getUserRemove(req, res) {
		if (req.params.id == req.user.id) {
			return this.displayError(req, res, 'You cannot delete the logged in user.', this.getRoute())
		}

		let persist = {}

		this.models.users.getById(req.params.id)
		.then(user => {
			if (!user) {
				throw new Error('User not found')
			}

			persist = {
				...persist,
				user
			}

			return this.models.items.getOnLoanByUserId(user.id)
		})
		.then(items => {
			if (items.length) {
				throw new Error('Users cannot be deleted if they have items on loan to them')
			}

			const {user} = persist

			res.render('confirm-remove', {
				selected: user
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	postUserRemove(req, res) {
		if (req.params.id == req.user.id) {
			return this.displayError(req, res, 'You cannot delete the logged in user.', this.getRoute())
		}

		let _user

		this.models.users.getById(req.params.id)
		.then(user => {
			if (!user) {
				throw new Error('User not found')
			}
			_user = user
			return this.models.items.getOnLoanByUserId(user.id)
		})
		.then(items => {
			if (items.length) {
				throw new Error('Users cannot be deleted if they have items on loan to them')
			}
			return this.models.actions.removeByUserId(_user.id)
		})
		.then(() => {
			return this.models.users.remove(_user.id)
		})
		.then(results => {
			req.flash('success', 'User and their history removed')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	getReset(req, res) {
		const user = {
			pw_attempts: 0
		}

		this.models.users.update(req.params.id, user)
		.then(id => {
			req.flash('success', 'Password attempts reset to zero')
			req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`))
		})
		.catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)))
	}

	getEmail(req, res) {
		let persist = {}
		this.models.users.query()
		.getContactById(req.params.id)
		.then(user => {
			if (!user) {
				throw new Error('User not found')
			}

			persist = {
				...persist,
				user
			}

			return this.models.items.getOnLoanByUserId(req.params.id)
		})
		.then((items) => {
			if (items.length < 1) {
				req.flash('warning', 'This user has no items on loan to email about')
				req.saveSessionAndRedirect(this.getRoute())
				return
			}

			if (!req.user.template_id) {
				req.flash('warning', 'You must set an email template for your profile')
				req.saveSessionAndRedirect(this.getRoute())
				return
			}

			const {user} = persist

			const to = {
				name: user.name,
				address: user.email
			}
						
			const replyTo = {
				name: req.user.name,
				address: req.user.email
			}

			const tags = {
				name: to.name,
				items: items.map((item) => {return `\t• ${item.name} (${item.barcode})`}).join("\n"),
				org: Options.getText('organisation_name'),
				sender: replyTo.name
			}

			Mail.queueTemplate(to, replyTo, req.user.template_subject, req.user.template_body, tags)
			req.flash('success', `Email queued to send to ${user.name}`)
			req.saveSessionAndRedirect(`${this.getRoute()}/${user.id}`)
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	postMultiEmail(req, res) {
		const ids = req.body.ids.split(',')
		this.models.users.query().getMultipleByIds(ids)
		.then(users => {
			if (!req.user.template_id) {
				req.flash('warning', 'You must set an email template for your profile')
				req.saveSessionAndRedirect(this.getRoute())
				return
			}
						
			const replyTo = {
				name: req.user.name,
				address: req.user.email
			}

			users.forEach((user) => {
				this.models.items.getOnLoanByUserId(user.id).then(items => {
					if (items.length > 0) {
						const to = {
							name: user.name,
							address: user.email
						}

						const tags = {
							name: to.name,
							items: items.map((item) => {return `\t• ${item.name} (${item.barcode})`}).join("\n"),
							org: Options.getText('organisation_name'),
							sender: replyTo.name
						}
			
						Mail.queueTemplate(to, replyTo, req.user.template_subject, req.user.template_body, tags)	
					}
				})
			})
			
			req.flash('success', `Emails queued`)
			req.saveSessionAndRedirect(`${this.getRoute()}`)
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}
}

module.exports = UsersController
