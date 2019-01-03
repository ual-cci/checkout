const NewDepartments = require('../../src/models/new/departments.js');
const NewCourses = require('../../src/models/new/courses.js');
const NewYears = require('../../src/models/new/years.js');

class CheckoutController {
  getHome(req, res) {
    const departmentsModel = new NewDepartments();
    const coursesModel = new NewCourses();
    const yearsModel = new NewYears();

    Promise.all([
      departmentsModel.getAll(),
      coursesModel.getAll(),
      yearsModel.getAll(),
    ])
      .then(results => {
        res.render( 'index', {
          departments: results[0],
          courses: results[1],
          years: results[2]
        } );
      });
  }
}

module.exports = CheckoutController;
