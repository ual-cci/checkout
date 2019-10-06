const BaseModel = require('./base.js')

class LocationModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'locations'
		})
	}

	getAll() {
		return this.orderBy([['name']]).retrieve()
	}
}

module.exports = LocationModel
