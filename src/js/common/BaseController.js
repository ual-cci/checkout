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
    return [this.mountPath, tail].join('');
  }

  displayError(req, res, err, route = '', message = 'Error - ') {
    // TODO add error logging
    console.log(err);
    req.flash('danger', [message, err].join(''));
    return res.redirect(route);
  }

  displayErrorJson(req, res, err) {
    const data = {
      status: 'danger'
    };

    const _err = typeof err === 'string' ? { message: err } : err;

    // TODO add error logging
    console.log(_err);

    return res.json({
      ...data,
      ..._err
    });
  }
}

module.exports = BaseController;
