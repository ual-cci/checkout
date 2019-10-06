const BaseModel = require('./base.js')

class ReservationModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'reservations'
		})
	}

	get joins() {
		return {
			owner: {
				prefix: 'owner_',
				table: 'users',
				alias: 'owners',
				join: ['owners.id', 'owner_id'],
				properties: ['id', 'name']
			},
			operator: {
				prefix: 'operator_',
				table: 'users',
				alias: 'operators',
				join: ['operators.id', 'operator_id'],
				properties: ['id', 'name']
			},
			item: {
				prefix: 'item_',
				table: 'items',
				join: ['id', 'item_id'],
				properties: ['id', 'name']
			}
		}
	}

	get properties() {
		return ['id', 'item_id', 'start_date', 'end_date', 'operator_id', 'action', 'owner_id']
	}

	getAll() {
		return this.lookup(['owner','operator','item']).orderBy([['start_date']]).retrieve()
	}
}

module.exports = ReservationModel
