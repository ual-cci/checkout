const	express = require( 'express' );

const auth = require('../../src/js/authentication' );
const AuditController = require('./controller.js');

const controller = new AuditController();
const app = express();
app.set( 'views', __dirname + '/views' );

// Audited report
app.get( '/scanned', auth.isLoggedIn, function( req, res ) {
  controller.getScanned(req, res);
} );

// Missing report
app.get( '/missing', auth.isLoggedIn, function( req, res ) {
  controller.getMissing(req, res);
});

module.exports = function( config ) { return app; };
