module.exports = {
	AVAILABILITY: {
		ON_LOAN: 'on-loan',
		LOST: 'lost',
		BROKEN: 'broken',
		AVAILABLE: 'available',
		SOLD: 'sold'
	},
	STATUS: {
		ACTIVE: 'active',
		DISABLED: 'disabled'
	},
	DEFAULT_SORTS: [ 'status', 'barcode', 'name', 'owner', 'role', 'course', 'year', 'group', 'location', 'department', 'value', 'issued', 'due', 'loanable' ],
	DEFAULT_DIRECTIONS: [ 'asc', 'desc' ],
	ACTIONS: {
		AUDITED: 'audited',
		RETURNED: 'returned',
		REPAIRED: 'repaired',
		REPLACED: 'replaced',
		FOUND: 'found',
		ISSUED: 'issued',
		BROKEN: 'broken',
		LOST: 'lost',
		SOLD: 'sold'
	},
	SORTBY_MUTATIONS: {
		DEFAULT: (sortBy) => {
			switch(sortBy) {
				default:
					return sortBy
			}
		},
		ITEMS: (sortBy) => {
			switch(sortBy) {
				case 'owner':
					return 'owner_name'
				case 'course':
					return 'owner_course_name'
				case 'year':
					return 'owner_year_name'
				case 'group':
					return 'group_name'
				case 'location':
					return 'location_name'
				case 'department':
					return 'department_name'
				default:
					return sortBy
			}
		},
		USERS: (sortBy) => {
			switch(sortBy) {
				case 'role':
					return 'role_name'
				case 'course':
					return 'course_name'
				case 'year':
					return 'year_name'
				default:
					return sortBy
			}
		}
	}
}
