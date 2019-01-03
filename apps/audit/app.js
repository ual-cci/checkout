const	express = require( 'express' );
const moment = require( 'moment' );

const auth = require('../../src/js/authentication' );
const AuditController = require('./controller.js');

const app = express();
app.set( 'views', __dirname + '/views' );

// Audited report
app.get( '/scanned', auth.isLoggedIn, function( req, res ) {
  const controller = new AuditController();
  const date = req.user.audit_point ? moment(req.user.audit_point) : moment().startOf('day');

  controller.constructQuery(req, res)
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
} );

// Missing report
app.get( '/missing', auth.isLoggedIn, function( req, res ) {
  const controller = new AuditController();
  const date = req.user.audit_point ? moment(req.user.audit_point) : moment().startOf('day');

  controller.constructQuery(req, res)
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
});

module.exports = function( config ) { return app; };
