const {DEFAULT_DIRECTIONS, DEFAULT_SORTS, SORTBY_MUTATIONS} = require('./common/constants')

module.exports = {
	constructTarget: () => {
		const {POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB} = process.env
		return `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`
	},
	createRoutePath: (path) => {
		return ['/', path].join('')
	},
	getSortBy: (_sortby, _direction, {validSorts = DEFAULT_SORTS, validDirections = DEFAULT_DIRECTIONS, defaultSortby = 'barcode', defaultDirection = 'asc', mutator = SORTBY_MUTATIONS.DEFAULT}) => {
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
