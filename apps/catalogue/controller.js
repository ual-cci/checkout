const moment = require('moment')

const BaseController = require('../../src/js/common/BaseController.js')

const Items = require('../../src/models/items.js')

const {getSortBy} = require('../../src/js/utils.js')
const {AVAILABILITY, SORTBY_MUTATIONS} = require('../../src/js/common/constants')

const config = require('./config.json')

class CatalogueController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			items: new Items(),
		}
	}

	/**
	* Builds the data necessary for the home page
	* with the relevant ordering inferred by the query
	* parameters
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	getRoot(req, res) {
		// Get items
		this.models.items.getCatalogue()
		.then(items => {
			res.render('index', {
				items
			})
		})
	}

	getMarkdown(req, res) {
		// Get items
		this.models.items.getCatalogue()
		.then(items => {
			let md = `*This list was updated on ${moment().format('DD/MM/YYYY')}.*\n\n`
			items.forEach(item => {
				console.log(item.urls.length)
				if (item.urls.length == 1 && item.urls[0] != '') {
					md += ` - [${item.name}](${item.urls[0]})`
				} else if (item.urls.length > 1) {
					md += ` - ${item.name}`
					item.urls.forEach((u, i) => {
						md += ` [🌐${i+1}](${u})`
					})
				} else {
					md += ` - ${item.name}`
				}
				md += '\n'
			})
			res.render('md', {md})
		})
	}
}

module.exports = CatalogueController
