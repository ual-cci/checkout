const BaseModel = require('./base.js')

class UserModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'users'
		})
	}

	get joins() {
		return {
			role: {
				table: 'roles',
				join: ['id', 'role_id'],
				properties: ['id', 'name', 'home']
			},
			course: {
				table: 'courses',
				join: ['id', 'course_id'],
				properties: ['id', 'name']
			},
			year: {
				table: 'years',
				join: ['id', 'year_id'],
				properties: ['id', 'name']
			},
			contact: {
				prefix: 'course_contact_',
				table: 'users',
				alias: 'contact',
				join: ['courses.contact_id', 'contact.id'],
				properties: ['id', 'name', 'email']
			},
			printer: {
				table: 'printers',
				join: ['id', 'printer_id'],
				properties: ['id', 'name', 'label', 'url']
			},
			template: {
				table: 'templates',
				join: ['id', 'template_id'],
				properties: ['id', 'name', 'subject', 'body']
			}
		}
	}

	get properties() {
		return ['id', 'name', 'email', 'barcode', 'disable', 'pw_attempts', 'audit_point', 'printer_id', 'role_id', 'template_id', 'columns']
	}

	get allProperties() {
		return ['id', 'name', 'email', 'barcode', 'disable', 'pw_hash', 'pw_salt', 'pw_iterations', 'pw_attempts', 'audit_point', 'printer_id', 'role_id', 'template_id']
	}

	getAll() {
		return this.retrieve()
	}

	getByBarcode(barcode) {
		return this.query().lookup(['role', 'course', 'year', 'contact', 'printer']).where([['barcode', barcode]]).retrieveSingle()
	}

	getByEmail(email, include) {
		return this.query(include == 'all' ? true : false).where([['email', email]]).retrieveSingle()
	}

	getContactById(id) {
		return this.query()
			.lookup(['course', 'contact'])
			.where([['id', id]])
			.retrieveSingle()
	}

	updateCourse(oldCourseId, newCourseId) {
		return new Promise((resolve, reject) => {
			this.query()
				.expose()
				.where('course_id', oldCourseId)
				.update({
					'course_id': newCourseId
				})
				.then(() => {
					resolve(newCourseId)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	updatePrinter(oldPrinterId, newPrinterId) {
		return new Promise((resolve, reject) => {
			this.query()
				.expose()
				.where('printer_id', oldPrinterId)
				.update({
					'printer_id': newPrinterId
				})
				.then(() => {
					resolve(newPrinterId)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	updateYear(oldYearId, newYearId) {
		return new Promise((resolve, reject) => {
			this.query()
				.expose()
				.where('year_id', oldYearId)
				.update({
					'year_id': newYearId
				})
				.then(() => {
					resolve(newYearId)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	updateRole(oldRoleId, newRoleId) {
		return new Promise((resolve, reject) => {
			this.query()
				.expose()
				.where('role_id', oldRoleId)
				.update({
					'role_id': newRoleId
				})
				.then(() => {
					resolve(newRoleId)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	search(term) {
		return super.search(term, ['name', 'barcode', 'email'], ['name', 'asc'])
	}
}

module.exports = UserModel
