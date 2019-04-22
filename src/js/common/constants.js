module.exports = {
  AVAILABILITY: {
    ON_LOAN: 'on-loan',
    LOST: 'lost',
    BROKEN: 'broken',
    AVAILABLE: 'available',
  },
  STATUS: {
    ACTIVE: 'active',
    DISABLED: 'disabled'
  },
  DEFAULT_SORTS: [ 'status', 'barcode', 'name', 'owner', 'course', 'year', 'group', 'location', 'department', 'value', 'issued', 'due' ],
  DEFAULT_DIRECTIONS: [ 'asc', 'desc' ],
  ACTIONS: {
    AUDITED: 'audited',
    RETURNED: 'returned',
    REPAIRED: 'repaired',
    FOUND: 'found',
    ISSUED: 'issued',
    BROKEN: 'broken',
    LOST: 'lost'
  },
  SORTBY_MUTATIONS: {
    DEFAULT: (sortBy) => {
      switch(sortBy) {
        default:
          return sortBy;
      }
    },
    ITEMS: (sortBy) => {
      switch(sortBy) {
        case 'owner':
          return 'owner_name';
        case 'course':
          return 'owner_course_name';
        case 'year':
          return 'owner_year_name';
        case 'group':
          return 'group_name';
        case 'location':
          return 'location_name';
        case 'department':
          return 'department_name';
        default:
          return sortBy;
      }
    },
    USERS: (sortBy) => {
      switch(sortBy) {
        case 'course':
          return 'course_name';
        case 'year':
          return 'year_name';
        default:
          return sortBy;
      }
    }
  }
};
