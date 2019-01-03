const moment = require( 'moment' );

const NewItems = require('../../src/models/new/items.js');
const NewDepartments = require('../../src/models/new/departments.js');
const NewGroups = require('../../src/models/new/groups.js');

class AuditController {
  /**
   *  A helper function to determine whether the columns
   *  are being sorted by anything
   *
   * @param {String?} _sortby The column to sort by
   * @param {String?} _direction One of 'asc' or 'desc'
   */
  getSortBy(_sortby, _direction) {
    const sort_options = ['status', 'barcode', 'name', 'owner', 'group', 'department', 'value'];
    const dir_options = ['asc', 'desc'];

    if (sort_options.indexOf(_sortby) >= 0 && dir_options.indexOf(_direction) >= 0) {
      const sort = {
        orderBy: _sortby,
        direction: _direction
      };

      switch(_sortby) {
        case 'owner':
          sort.orderBy = 'owner_name';
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

  /**
   * The same method that both routes need so combined into
   * one not-repeated method
   *
   * @param {Object} req
   * @param {Object} res
   */
  getShared(req, res) {
    const { orderBy, direction } = this.getSortBy(req.query.sortby, req.query.direction);

    const departmentsModel = new NewDepartments();
    const groupsModel = new NewGroups();

    const selected = {
      status: req.query.status ? req.query.status : '',
      department: req.query.department ? req.query.department : '',
      group: req.query.group ? req.query.group : ''
    };

    return Promise.all([
      groupsModel.getAll(),
      departmentsModel.getAll()
    ])
      .then(results => {
        return {
          groups: results[0],
          departments: results[1],
          query: this.getSharedQuery(selected, orderBy, direction),
          selected,
          orderBy,
          direction
        };
      });
  }

  getSharedQuery(selected, orderBy, direction) {
    const itemsModel = new NewItems();

    return itemsModel.query()
      .lookup(['group', 'department', 'user', 'course', 'year'])
      .if(selected.status, (query) => {
        query.where('status', selected.status);
      })
      .if(selected.group, (query) => {
        query.where('group_id', selected.group);
      })
      .if(selected.department, (query) => {
        query.where('department_id', selected.department);
      })
      .orderBy([
        [ orderBy, direction ]
      ]);
  }

  getScanned(req, res) {
    const date = req.user.audit_point ? moment(req.user.audit_point) : moment().startOf('day');
    this.getShared(req, res)
      .then(({groups, departments, query, selected, orderBy, direction}) => {
        query.where([
          ['audited', '>=', date]
        ])
        .get()
        .then(items => {
          res.render( 'report', {
            status: 'Scanned',
            items: items,
            departments: departments,
            groups: groups,
            selected: selected,
            sortby: ( req.query.sortby ? req.query.sortby : 'barcode' ),
            direction: ( req.query.direction ? req.query.direction : 'asc' ),
            filter_path: '/audit/scanned/'
          } );
        });
      });
  }

  getMissing(req, res) {
    const date = req.user.audit_point ? moment(req.user.audit_point) : moment().startOf('day');
    this.getShared(req, res)
      .then(({groups, departments, query, selected, orderBy, direction}) => {
        query.raw((query) => {
          query.andWhere(function() {
            this.where('items.audited', null).orWhere('items.audited', '<', date);
          });
        })
        .get()
        .then(items => {
          res.render( 'report', {
            status: 'Missing',
            items: items,
            departments: departments,
            groups: groups,
            selected: selected,
            sortby: orderBy,
            direction: direction,
            filter_path: '/audit/missing/'
          } );
        });
      });
  }
}

module.exports = AuditController;
