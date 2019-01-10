const BaseController = require('../../src/js/common/BaseController.js');
const config = require('./config.json');

const NewDepartments = require('../../src/models//departments.js');
const NewCourses = require('../../src/models//courses.js');
const NewYears = require('../../src/models//years.js');

class CheckoutController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      departments: new NewDepartments(),
      courses: new NewCourses(),
      years: new NewYears()
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
      this.models.departments.getAll(),
      this.models.courses.getAll(),
      this.models.years.getAll(),
    ])
      .then(([departments, courses, years]) => {
        res.render('index', {
          departments,
          courses,
          years
        });
      });
  }
}

module.exports = CheckoutController;
