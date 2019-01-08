const DEFAULT_SORTS = [ 'status', 'barcode', 'name', 'owner', 'course', 'year', 'group', 'department', 'value' ];
const DEFAULT_DIRECTIONS = [ 'asc', 'desc' ];

module.exports = {
  constructTarget: () => {
    const { DB_USER, DB_HOST, DB_PORT, DB_NAME } = process.env;
    return `postgres://${DB_USER}@${ DB_HOST }:${ DB_PORT }/${ DB_NAME }`;
  },
  createRoutePath: (path) => {
    return ['/', path].join('')
  },
  getSortBy: (_sortby, _direction, _validSorts = DEFAULT_SORTS, _validDirections = DEFAULT_DIRECTIONS) => {
    const sort_options = _validSorts;
    const dir_options = _validDirections;

    if (sort_options.indexOf(_sortby) >= 0 && dir_options.indexOf(_direction) >= 0) {
      const sort = {
        orderBy: _sortby,
        direction: _direction
      };

      switch(_sortby) {
        case 'owner':
          sort.orderBy = 'owner_name';
          break;
        case 'course':
          sort.orderBy = 'owner_course_name';
          break;
        case 'year':
          sort.orderBy = 'owner_year_name';
          break;
        case 'group':
          sort.orderBy = 'group_name';
          break;
        case 'department':
          sort.orderBy = 'department_name';
          break;
      }

      return sort;
    }

    return {
      orderBy: 'barcode',
      direction: 'asc'
    };
  }
}
