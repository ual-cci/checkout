const BaseController = require('../../src/js/common/BaseController.js');
const config = require('./config.json');

const NewDepartments = require('../../src/models/new/departments.js');
const NewCourses = require('../../src/models/new/courses.js');
const NewYears = require('../../src/models/new/years.js');

class CheckoutController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      departments: new NewDepartments(),
      courses: new NewCourses(),
      years: new NewYears()
    };
  }

  getHome(req, res) {
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
