const BaseController = require('../../src/js/common/BaseController.js')

const Items = require('../../src/models/items.js')

const config = require('./config.json')

class ItemController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			items: new Items()
		}
	}


	/**
	* Gets the insurance report form
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getInsurance(req, res) {
		res.render('insurance')
	}

	/**
	* Endpoint for removing an item
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postInsurance(req, res) {
		var delimiter
		var format = 'txt'
		if (req.body.format == 'csv') {
			delimiter = ","
			format = 'csv'
		}

		if (req.body.format == 'tsv') {
			delimiter = "\t"
			format = 'tsv'
		}

		this.models.items.query()
		.where([['value', '>=', req.body.min_value]])
		.orderBy([
			[ 'name', 'asc' ]
		])
		.expose()
		.then(items => {
			var data = []
			data.push(['Name','Serial Number','Value','Department','Location','Group'].join(delimiter))

			for (var i = 0; i < items.length; i++) {
				var item = items[i]
				var row = []
				row.push(this._default(item.name))
				row.push(this._default(item.serialnumber))
				row.push(this._default(item.value))
				row.push(this._default(item.department_name))
				row.push(this._default(item.location_name))
				row.push(this._default(item.group_name))
				data.push(row.join(delimiter))
			}
			data = data.join("\n")
			console.log(format)
			res.set('Content-Disposition', `inline; filename=insurance-report.${format}`)
			res.set('Content-Type', `text/${format}`)
			res.send(data)
		})
	}

	_default(value) {
		return value ? value : ''
	}
}

module.exports = ItemController
