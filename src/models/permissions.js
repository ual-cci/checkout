const BaseModel = require('./base.js')

class PermissionsModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'permissions'
		})
	}

	getByRoleId(id) {
		return this.query().where([['role_id', id]]).retrieve()
	}

	getAll() {
		return this.orderBy([['name']]).retrieve()
	}

	removeRole(id) {
		return new Promise((resolve, reject) => {
			const query = this.query().expose()
				.where('role_id', id)
				.delete()

			if (this.options.debug) {
				console.log(query.toString())
			}

			query.then(() => {
					resolve(id)
				})
				.catch(err => {
					reject(err)
				})
				.finally(() => {
					this._reset()
				})
		})
	}
}

module.exports = PermissionsModel
