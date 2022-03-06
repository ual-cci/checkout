const db = require('../js/database.js')
const BaseModel = require('./base.js')
const {AVAILABILITY} = require('../js/common/constants')

class ItemModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'items'
		})
	}

	get joins() {
		return {
			group: {
				table: 'groups',
				join: ['id', 'group_id'],
				properties: ['id', 'name', 'limiter', 'duration']
			},
			location: {
				table: 'locations',
				join: ['id', 'location_id'],
				properties: ['id', 'name']
			},
			department: {
				table: 'departments',
				join: ['id', 'department_id'],
				properties: ['id', 'name', 'brand']
			},
			user: {
				prefix: 'owner_',
				table: 'users',
				join: ['id', 'owner_id'],
				properties: ['id', 'name']
			},
			course: {
				prefix: 'owner_course_',
				table: 'courses',
				join: ['id', 'users.course_id'],
				properties: ['id', 'name']
			},
			year: {
				prefix: 'owner_year_',
				table: 'years',
				join: ['id', 'users.year_id'],
				properties: ['id', 'name']
			}
		}
	}

	get bootstrap() {
		return ['group', 'location', 'department', 'user', 'course', 'year']
	}

	get properties() {
		return ['id', 'name', 'barcode', 'notes', 'value', 'label', 'status', 'audited', 'updated', 'serialnumber', 'issued', 'due', 'loanable', 'info_url', 'alert_msg']
	}

	updateLocation(oldLocationId, newLocationId) {
		return new Promise((resolve, reject) => {
			this.query()
				.expose()
				.where('location_id', oldLocationId)
				.update({
					'location_id': newLocationId
				})
				.then(() => {
					resolve(newLocationId)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	updateDepartment(oldDepartmentId, newDepartmentId) {
		return new Promise((resolve, reject) => {
			this.query()
				.expose()
				.where('department_id', oldDepartmentId)
				.update({
					'department_id': newDepartmentId
				})
				.then(() => {
					resolve(newDepartmentId)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	updateGroup(oldGroupId, newGroupId = null) {
		return new Promise((resolve, reject) => {
			this.query()
				.expose()
				.where('group_id', oldGroupId)
				.update({
					'group_id': newGroupId
				})
				.then(() => {
					resolve(newGroupId)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	getOnLoanByUserId(userId) {
		return this.query()
			.where([
				['status', AVAILABILITY.ON_LOAN],
				['owner_id', userId]
			])
			.expose()
	}

	search(term) {
		return super.search(term, ['name', 'barcode', 'serialnumber'], ['barcode', 'asc'])
	}

	getByBarcode(barcode) {
		return this.query().where([['barcode', barcode]]).retrieveSingle()
	}

	getCatalogue() {
		return this.emptyQuery()
			.expose()
			.select('items.name',
				db.raw(`SUM(CASE WHEN "items"."status" = 'available' THEN 1 ELSE 0 END) AS available`),
				db.raw(`ARRAY_REMOVE(ARRAY_AGG(DISTINCT "items"."info_url"), NULL) AS urls`))
			.count('items.id AS stock')
			.orderBy('name', 'asc')
			.where('loanable', true)
			.groupBy('items.name')
	}

	audit(barcode) {
		return this.getByBarcode(barcode)
				.then(item => {
					if (!item) {
						throw new Error('Unknown item')
					}

					return this.query()
						.update(item.id, {
							audited: new Date()
						})
						.then(id => {
							return item
						})
				})
	}

	changeStatus(barcode, status) {
		return this.getByBarcode(barcode)
				.then(item => {
					if (!item) {
						throw new Error('Unknown item')
					}

					return this.query()
						.update(item.id, {
							status: status,
							owner_id: null,
							issued: null,
							due: null,
							updated: new Date()
						})
						.then(id => {
							return item
						})
				})
	}

	return(barcode) {
		return this.changeStatus(barcode, AVAILABILITY.AVAILABLE)
	}

	broken(barcode) {
		return this.changeStatus(barcode, AVAILABILITY.BROKEN)
	}

	lost(barcode) {
		return this.changeStatus(barcode, AVAILABILITY.LOST)
	}
	
	sold(barcode) {
		return this.changeStatus(barcode, AVAILABILITY.SOLD)
	}

	issue(itemId, userId, operator, dueDate) {
		return this.update(itemId, {
			status: AVAILABILITY.ON_LOAN,
			owner_id: userId,
			due: dueDate,
			issued: new Date(),
			updated: new Date()
		})
	}
}

module.exports = ItemModel
