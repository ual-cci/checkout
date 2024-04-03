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

	getByType(templateType) {
		return this.query().where([['type', templateType]]).retrieve()
	}
}

module.exports = TemplatesModel
