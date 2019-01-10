const BaseController = require('../../src/js/common/BaseController.js');

const config = require('./config.json');

class LoginController extends BaseController {
  constructor() {
    super({ path: config.path });
  }

  getRoot(req, res) {
    if (req.isAuthenticated()) {
      res.redirect(this.getRoute());
    } else {
      res.render('login');
    }
  }

  postRoot(req, res) {
    if (req.session.requested != undefined) {
      res.redirect(req.session.requested);
      delete req.session.requested;
    } else {
      res.redirect('/checkout');
    }
  }
}

module.exports = LoginController;
