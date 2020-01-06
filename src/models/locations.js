const BaseModel = require('./base.js')

class LocationModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'locations'
		})
	}

	get properties() {
		return ['id', 'name', 'barcode']
	}

	getAll() {
		return this.orderBy([['name']]).retrieve()
	}
}

module.exports = LocationModel
