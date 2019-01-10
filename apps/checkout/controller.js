const BaseController = require('../../src/js/common/BaseController.js');
const config = require('./config.json');

const Locations = require('../../src/models/locations.js');
const Courses = require('../../src/models/courses.js');
const Years = require('../../src/models/years.js');

class CheckoutController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      locations: new Locations(),
      courses: new Courses(),
      years: new Years()
    };
  }

  /**
   * Gets all the data necessary for load of the
   * home page
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getRoot(req, res) {
    Promise.all([
      this.models.locations.getAll(),
      this.models.courses.getAll(),
      this.models.years.getAll(),
    ])
      .then(([locations, courses, years]) => {
        res.render('index', {
          locations,
          courses,
          years
        });
      });
  }
}

module.exports = CheckoutController;
