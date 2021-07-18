const db = require('../js/database.js')
const logs = require('../../logging/index')

class BaseModel {
	constructor({table, debug = false}) {
		this.options = {
			table: table,
			debug
		}
	}

	get joins() {
		return {}
	}

	get properties() {
		return []
	}

	get bootstrap() {
		return []
	}

	/**
	 * Method to erase or reset references to
	 * a previous query
	 */
	_reset() {
		this.query()
	}

	/**
	 * Creates a new row using the given values
	 *
	 * @param {Object} values
	 */
	create(values) {
		return new Promise((resolve, reject) => {
			const query = db(this.options.table).insert(values, 'id')

			this.logQuery(query, 'create')

			query.then(ids => {
					resolve(ids)
				})
				.catch(err => {
					reject(err)
				})
				.finally(() => {
					this._reset()
				})
		})
	}

	/**
	 * Updates a row's values using its ID
	 *
	 * @param {Number} id
	 * @param {Object} values
	 */
	update(id, values) {
		return new Promise((resolve, reject) => {
			const query = this.query().where([['id', id]]).expose().update(values)

			this.logQuery(query, 'update')

			query.then(ids => {
					resolve(ids)
				})
				.catch(err => {
					reject(err)
				})
				.finally(() => {
					this._reset()
				})
		})
	}

	/**
	 * Update multiple rows with the same values at once
	 *
	 * @param {Array} ids
	 * @param {Object} values
	 */
	updateMultiple(ids, values) {
		return new Promise((resolve, reject) => {
			const query = this.query().getMultipleByIds(ids).update(values)

			this.logQuery(query, 'updateMultiple')

			query.then(ids => {
					resolve(ids)
				})
				.catch(err => {
					reject(err)
				})
				.finally(() => {
					this._reset()
				})
		})
	}

	/**
	 * Removes a row from the DB using its ID
	 *
	 * @param {Number} id
	 */
	remove(id) {
		return new Promise((resolve, reject) => {
			const query = this.query().expose()
				.where('id', id)
				.delete()

			this.logQuery(query, 'remove')

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

	/**
	 * Remove multiple rows at once
	 *
	 * @param {Array} ids
	 * @param {Object} values
	 */
	removeMultiple(ids) {
		return new Promise((resolve, reject) => {
			const query = this.query().getMultipleByIds(ids).delete()

			this.logQuery(query, 'removeMultiple')

			query.then(ids => {
					resolve(ids)
				})
				.catch(err => {
					reject(err)
				})
				.finally(() => {
					this._reset()
				})
		})
	}

	/**
	 * Makes sure a query has been created
	 * and creates one if not
	 *
	 * @private
	 */
	_safeguard() {
		if (!this._queryObj) {
			this.query()
		}
	}

	/**
	 * A helper function to turn a list into knex like
	 * select object
	 *
	 * @param {Array} properties The list of properties
	 * @param {String?} table An override for table to select from
	 * @param {String?} prefix A prefix if the selects need to be aliased
	 * @private
	 */
	_propertiesToSelect(properties, table = false, prefix = '') {
		const obj = {}

		properties.forEach(prop => {
			obj[`${prefix}${prop}`] = `${table ? table : this.options.table}.${prop}`
		})

		return obj
	}

	_getColumn(name, table = false) {
		return name.indexOf('.') >= 0 ? name : `${table ? table : this.options.table}.${name}`
	}

	/**
	 * Creates a new knex query and attaches the
	 * models default selects to it
	 */
	 query(all_properties = false) {
		this._queryObj = db(this.options.table)

		if (this.properties.length) {
			this._queryObj.select(this._propertiesToSelect(all_properties?this.allProperties:this.properties))
		}

		this.lookup(this.bootstrap)

		return this
	}

	/**
	 * Creates a new empty knex query
	 */
	 emptyQuery() {
		this._queryObj = db(this.options.table)

		return this
	}

	/**
	 * Rewraps a knex query
	 */
	rewrap(q) {
		this._queryObj = q
		return this
	}

	/**
	 * Allows querying on the base knex object
	 * withouting ejecting it
	 *
	 * @param {Function} func Querying function utilising the knex object
	 */
	raw(func) {
		this._safeguard()
		func(this._queryObj)
		return this
	}

	/**
	 * A block that can be inlined in a promise chain, to apply
	 * modifications to a query if matched
	 *
	 * @param {*} condition The conditional statement to execute the code
	 * @param {Function} func A raw interfacing function
	 */
	if(condition, func) {
		this._safeguard()

		if (condition) {
			return this.raw(func)
		}

		return this
	}

	/**
	 * Adds a where argument to the query
	 *
	 * @param {Array} args Multidimensional array of either 2 or 3 values
	 * @param {String} type One of 'where', 'andWhere' and 'orWhere
	 */
	where(args, type = 'where') {
		this._safeguard()

		args.forEach(a => {
			const column = a[0].indexOf('.') >= 0 ? a[0] : `${this.options.table}.${a[0]}`
			switch (a.length) {
				case 2:
					this._queryObj[type](column, a[1])
					break
				case 3:
					this._queryObj[type](column, a[1], a[2])
					break
			}
		})

		return this
	}

	/**
	 * Adds an order by to the query
	 *
	 * @param {Array} args Multidimensional array of either 1 or 2 values
	 */
	orderBy(args) {
		this._safeguard()

		args.forEach(a => {
			switch (a.length) {
				case 1:
					this._queryObj.orderBy(a[0])
					break
				case 2:
					this._queryObj.orderBy(a[0], a[1])
					break
			}
		})

		return this
	}

	/**
	 * Adds a group by to the query
	 *
	 * @param {Array} args Single value
	 */
	groupBy(column) {
		this._safeguard()

		this._queryObj.groupBy(column)

		return this
	}

	/**
	 * Optional lookup and joins
	 *
	 * @param {Array} keys Single dimensional array of keys that
	 * are associated to the models joins get method
	 */
	lookup(keys) {
		this._safeguard()
		const joins = this.joins

		keys.forEach(k => {
			if (k in joins) {
				const {table, join, properties, prefix, alias} = joins[k]

				// If the key is absolute (with .) use it, if not create it
				const foreignJoinKey = this._getColumn(join[0], table)
				const tableJoinKey = this._getColumn(join[1])

				const tableTarget = alias ? `${table} AS ${alias}` : table

				this._queryObj.leftJoin(tableTarget, foreignJoinKey, tableJoinKey)
					.select(
						this._propertiesToSelect(
							properties,
							alias ? alias : table,
							prefix ? prefix :`${k}_`
						)
					)
			}
		})

		return this
	}

	/**
	 * Return the raw query object
	 */
	expose() {
		this._safeguard()

		if (this.options.debug) {
			console.log(this._queryObj.toString())
		}

		return this._queryObj
	}

	/**
	 * Wrapper to return results while
	 * adding a universal catch
	 */
	retrieve() {
		return new Promise((resolve, reject) => {
			this.expose()
				.then(results => {
					resolve(results)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	/**
	 * Wrapper method to resolve as the single
	 * and first item from a query
	 */
	retrieveSingle() {
		return new Promise((resolve, reject) => {
			const query = this.expose()

			this.logQuery(query, 'retreiveSingle')

			query.then(results => {
					resolve(results.length ? results[0] : false)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	/**
	 * Return item from id
	 *
	 * @param {Number} id
	 */
	getById(id) {
		return this.query().where([['id', id]]).retrieveSingle()
	}

	/**
	 * Wrapper function to return multiple items
	 * using their ids
	 *
	 * @param {Array} ids
	 */
	getMultipleByIds(ids) {
		const query = this.query().expose()
		this.logQuery(query, 'getMultipleByIds')

		if (!Array.isArray(ids)) {
			let newArray = []
			newArray.push(ids)
			ids = newArray
		}

		return query.whereIn(`${this.options.table}.id`, ids)
	}

	/**
	 * A method to search the underlying table
	 *
	 * @param {String} term Search term
	 * @param {Array} columns Columns to try match
	 * @param {Array} orderBy Column to order by
	 */
	search(term, columns = ['name'], orderBy = ['name', 'asc']) {
		const query = this.query()
			.raw(query => {
				columns.forEach((col, index) => {
					const method = index === 0 ? 'where' : 'orWhere'
					const _col = this._getColumn(col)
					query[method](_col, 'ilike', `%${term}%`)
				})
			})
			.orderBy([ orderBy ])
			.expose()

		this.logQuery(query, 'search')

		return query
	}

	logQuery(query, action) {
		logs.queries.info({
			table: this.options.table,
			query: query.toString(),
			action
		})
	}
}

module.exports = BaseModel
