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

  /**
   * A generic error method allowing piping of errors and
   * handling of logging
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   * @param {String} err The error message from the specific problem
   * @param {String?} route The route to redirect to in the subapp
   * @param {String?} message The prefix for all the errors
   */
  displayError(req, res, err, route = '', message = 'Error - ') {
    // TODO add error logging
    console.log(err);
    req.flash('danger', [message, err].join(''));
    return res.redirect(route);
  }


  /**
   * A generic error method allowing piping of errors and
   * handling of logging before returning JSON
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   * @param {String|Object} err The error message from the specific problem
   */
  displayErrorJson(req, res, err) {
    const data = {
      status: 'danger'
    };

    let _err;

    if (err instanceof Error) {
      _err = {
        message: err.message
      };
    } else if (typeof err === 'string') {
      _err = {
        message: err
      };
    } else {
      _err = err;
    }

    // TODO add error logging
    console.log(_err);

    return res.json({
      ...data,
      ..._err
    });
  }
}

module.exports = BaseController;
