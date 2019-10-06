const {DEFAULT_DIRECTIONS, DEFAULT_SORTS, SORTBY_MUTATIONS } = require('./common/constants')

module.exports = {
	constructTarget: () => {
		const {DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME} = process.env
		return `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
	},
	createRoutePath: (path) => {
		return ['/', path].join('')
	},
	getSortBy: (_sortby, _direction, {validSorts = DEFAULT_SORTS, validDirections = DEFAULT_DIRECTIONS, defaultSortby = 'barcode', defaultDirection = 'asc', mutator = SORTBY_MUTATIONS.DEFAULT }) => {
		if (validSorts.indexOf(_sortby) >= 0 && validDirections.indexOf(_direction) >= 0) {
			return {
				orderBy: mutator(_sortby),
				direction: _direction
			}
		}

		return {
			orderBy: defaultSortby,
			direction: defaultDirection
		}
	},

}
