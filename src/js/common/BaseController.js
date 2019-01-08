const { createRoutePath } = require('../utils.js');

class BaseController {
  constructor({ path }) {
    this.mountPath = createRoutePath(path);
  }

  /**
   * Builds a string using the mount path
   * Route must use prefixed slash if necessary
   *
   * @param {String|Array} route
   */
  getRoute(route = '') {
    const tail = typeof route === 'string' ? route : route.join('');

    return [this.mountPath, route].join('');
  }

  displayError(req, res, err, route = '', message = 'Error - ') {
    req.flash('danger', [message, err].join(''));
    res.redirect(this.getRoute(route));
  }
}

module.exports = BaseController;
