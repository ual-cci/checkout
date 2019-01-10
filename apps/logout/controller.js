const BaseController = require('../../src/js/common/BaseController.js');

const config = require('./config.json');

class LogoutController extends BaseController {
  constructor() {
    super({ path: config.path });
  }

  getRoot(req, res) {
    req.logout();
    res.redirect('/login');
  }
}

module.exports = LogoutController;
