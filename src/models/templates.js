const BaseModel = require('./base.js')

class TemplatesModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'templates'
		})
	}

	getAll() {
		return this.orderBy([['name']]).retrieve()
	}
}

module.exports = TemplatesModel
