const BaseModel = require('./base.js')

const {ACTIONS} = require('../js/common/constants')

class ActionModel extends BaseModel {
	constructor(opts = {}) {
		super({
			...opts,
			table: 'actions'
		})
	}

	get joins() {
		return {
			item: {
				table: 'items',
				join: ['id', 'item_id'],
				properties: ['id', 'name', 'barcode']
			},
			user: {
				prefix: 'owner_',
				table: 'users',
				join: ['id', 'user_id'],
				properties: ['id', 'name']
			},
			operator: {
				prefix: 'operator_',
				table: 'users',
				alias: 'operators',
				join: ['operators.id', 'operator_id'],
				properties: ['id', 'name']
			}
		}
	}

	get bootstrap() {
		return ['user', 'operator']
	}

	get properties() {
		return ['id', 'item_id', 'user_id', 'datetime', 'action', 'operator_id', 'metadata']
	}

	create(values) {
		return super.create({
			...values,
			datetime: new Date(),
		})
	}

	getByItemId(itemId) {
		return this.query()
			.where([
				['item_id', itemId]
			])
			.orderBy([
				['datetime', 'desc']
			])
			.retrieve()
	}

	getByItemBarcode(barcode) {
		return this.query()
			.lookup(['item'])
			.where([
				['barcode', barcode]
			])
			.orderBy([
				['datetime', 'desc']
			])
			.retrieve()
	}

	removeByItemId(itemId) {
		return this.query()
			.where([
				['item_id', itemId]
			])
			.expose()
			.update({
				item_id: null
			})
	}

	removeUserId(userId) {
		return this.query()
			.where([
				['user_id', userId]
			])
			.expose()
			.update({
				user_id: null
			})
	}

	removeOperatorId(operatorId) {
		return this.query()
			.where([
				['operator_id', operatorId]
			])
			.expose()
			.update({
				operator_id: null
			})
	}

	getByUserId(userId) {
		return this.query()
			.lookup(['item'])
			.where([
				['user_id', userId]
			])
			.orderBy([
				['datetime', 'desc']
			])
			.retrieve()
	}

	getDateRange(start, end) {
		return this.query()
			.lookup(['item'])
			.raw(query => {
				query.whereBetween('datetime', [start, end])
				.andWhereNot('action', ACTIONS.AUDITED)
			})
			.orderBy([
				['datetime', 'desc']
			])
			.retrieve()
	}
}

module.exports = ActionModel
