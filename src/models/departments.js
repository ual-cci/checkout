const BaseModel = require('./base.js')

class DepartmentModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'departments'
		})
	}

	getAll() {
		return this.orderBy([['name']]).retrieve()
	}
}

module.exports = DepartmentModel
