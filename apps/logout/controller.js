const BaseController = require('../../src/js/common/BaseController.js');

const config = require('./config.json');

class LogoutController extends BaseController {
  constructor() {
    super({ path: config.path });
  }

  getRoot(req, res) {
    req.logout();
    req.session.save( function(err) {
      if ( err ) throw new Error(err);
      req.saveSessionAndRedirect('/login');
    } )
  }
}

module.exports = LogoutController;
