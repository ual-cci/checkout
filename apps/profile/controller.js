const BaseController = require('../../src/js/common/BaseController.js');
const config = require('./config.json');

const auth = require('../../src/js/authentication.js');

const Users = require('../../src/models/users.js');
const Printers = require('../../src/models/printers.js');

class ProfileController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      users: new Users(),
      printers: new Printers()
    };
  }

  /**
   * Displays current users profile
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getRoot(req, res) {
      this.models.printers.getAll()
        .then(printers => {
          res.render('profile', {printers});
        });
  }

  /**
   * Posts an edit for current user
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postRoot(req, res) {
    const user = {
      name: req.body.name,
      email: req.body.email,
      printer_id: req.body.printer ? req.body.printer : null,
    };

    if (req.body.audit_point) {
      user.audit_point = new Date(req.body.audit_point);
    } else {
      user.audit_point = null;
    }

    auth.generatePassword(req.body.password, password => {
      if (req.body.password) {
        user.pw_hash = password.hash;
        user.pw_salt = password.salt;
        user.pw_iterations = password.iterations;
      }

      this.models.users.update(req.user.id, user)
        .then(id => {
          req.flash('success', 'Profile updated');
          req.saveSessionAndRedirect(this.getRoute());
        })
        .catch(err => this.displayError(req, res, err, this.getRoute()));
    } );
  }
};

module.exports = ProfileController;
