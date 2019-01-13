const moment = require( 'moment' );

const BaseController = require('../../src/js/common/BaseController.js');
const config = require('./config.json');

const Items = require('../../src/models/items.js');
const Locations = require('../../src/models/locations.js');
const Groups = require('../../src/models/groups.js');

const { getSortBy } = require('../../src/js/utils.js');
const { SORTBY_MUTATIONS } = require('../../src/js/common/constants.js');

class AuditController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      locations: new Locations(),
      groups: new Groups(),
      items: new Items()
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
    const { orderBy, direction } = getSortBy(req.query.sortby, req.query.direction, {
      mutator: SORTBY_MUTATIONS.ITEMS
    });

    const selected = {
      status: req.query.status ? req.query.status : '',
      location: req.query.location ? req.query.location : '',
      group: req.query.group ? req.query.group : ''
    };

    return Promise.all([
      this.models.groups.getAll(),
      this.models.locations.getAll()
    ])
      .then(results => {
        return {
          groups: results[0],
          locations: results[1],
          query: this.getSharedQuery(selected, orderBy, direction),
          selected,
          orderBy,
          direction
        };
      });
  }

  /**
   * Returns the base query that the routes
   * share between them
   *
   * @param {Object} selected
   * @param {String} orderBy
   * @param {String} direction
   *
   * @returns {Object} Query
   */
  getSharedQuery(selected, orderBy, direction) {
    return this.models.items.query()
      .if(selected.status, (query) => {
        query.where('status', selected.status);
      })
      .if(selected.group, (query) => {
        query.where('group_id', selected.group);
      })
      .if(selected.location, (query) => {
        query.where('location_id', selected.location);
      })
      .orderBy([
        [ orderBy, direction ]
      ]);
  }

  /**
   * Gets the scanned items
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getScanned(req, res) {
    const date = req.user.audit_point ? moment(req.user.audit_point) : moment().startOf('day');
    this.getShared(req, res)
      .then(({groups, locations, query, selected, orderBy, direction}) => {
        query.where([
          ['audited', '>=', date]
        ])
        .expose()
        .then(items => {
          res.render( 'report', {
            status: 'Scanned',
            items: items,
            locations: locations,
            groups: groups,
            selected: selected,
            sortby: ( req.query.sortby ? req.query.sortby : 'barcode' ),
            direction: ( req.query.direction ? req.query.direction : 'asc' ),
            filter_path: '/audit/scanned/'
          } );
        });
      });
  }

  /**
   * Gets all missing items
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getMissing(req, res) {
    const date = req.user.audit_point ? moment(req.user.audit_point) : moment().startOf('day');
    this.getShared(req, res)
      .then(({groups, locations, query, selected, orderBy, direction}) => {
        query.raw((query) => {
          query.andWhere(function() {
            this.where('items.audited', null).orWhere('items.audited', '<', date);
          });
        })
        .expose()
        .then(items => {
          res.render( 'report', {
            status: 'Missing',
            items: items,
            locations: locations,
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
