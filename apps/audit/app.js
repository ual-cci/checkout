const	express = require( 'express' );

const auth = require('../../src/js/authentication' );
const AuditController = require('./controller.js');

const app = express();
app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new AuditController();
  next();
});

// Audited report
app.get( '/scanned', auth.isLoggedIn, (req, res ) => {
  req.controller.getScanned(req, res);
} );

// Missing report
app.get( '/missing', auth.isLoggedIn, (req, res ) => {
  req.controller.getMissing(req, res);
});

module.exports = function( config ) { return app; };
