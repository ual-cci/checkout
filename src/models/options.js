const BaseModel = require('./base.js')

class OptionsModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'options'
		})
	}

	getAll() {
		return this.orderBy([['key']]).retrieve()
	}
}

module.exports = OptionsModel
