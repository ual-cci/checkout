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
		const {orderBy, direction} = getSortBy(req.query.sortby, req.query.direction, {
			mutator: SORTBY_MUTATIONS.ITEMS
		})

		// Get items
		this.models.items.getCatalogue()
		.then(items => {
			console.log(items)
			res.render('index', {
				items,
				sortby: orderBy,
				direction
			})
		})
	}
}

module.exports = CatalogueController
