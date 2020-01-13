const BaseModel = require('./base.js')

class RoleModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'roles'
		})
	}

	getAll() {
		return this.orderBy([['name']]).retrieve()
	}
}

module.exports = RoleModel
