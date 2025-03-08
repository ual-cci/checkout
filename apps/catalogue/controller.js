const moment = require('moment')

const BaseController = require('../../src/js/common/BaseController.js')

const Items = require('../../src/models/items.js')
const Locations = require('../../src/models/locations.js')

const {getSortBy} = require('../../src/js/utils.js')
const {AVAILABILITY, SORTBY_MUTATIONS} = require('../../src/js/common/constants')

const config = require('./config.json')

class CatalogueController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			items: new Items(),
			locations: new Locations()
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
		this.models.items.getCatalogue()
		.then(items => {

			let locations = {}
			items.forEach(item => {
				if (locations[item.location_id] == undefined) {
					locations[item.location_id] = {'name': item.location_name, items: []}
				}

				item.urls = item.urls.filter(url => {
					if (url != '') return url
				})

				locations[item.location_id].items.push(item)
			})

			res.render('index', {locations})
		})
	}

	getMarkdown(req, res) {
		// Get items
		this.models.items.getCatalogue()
		.then(items => {
			let locations = []
			items.forEach(item => {
				if (locations[item.location_id] == undefined) {
					locations[item.location_id] = {'name': item.location_name, items: []}
				}

				item.urls = item.urls.filter(url => {
					if (url != '') return url
				})

				locations[item.location_id].items.push(item)
			})

			let md = `*This list was updated on ${moment().format('DD/MM/YYYY')}.*\n`

			locations.forEach(location => {
				md += `\n## ${location.name}\n`
				location.items.forEach(item => {
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
			})

			res.render('md', {md})
		})
	}
}

module.exports = CatalogueController
