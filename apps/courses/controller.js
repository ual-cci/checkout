const BaseController = require('../../src/js/common/BaseController.js');
const config = require('./config.json');

const NewCourses = require('../../src/models/new/courses.js');
const NewUsers = require('../../src/models/new/users.js');

class CoursesController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      courses: new NewCourses(),
      users: new NewUsers()
    };
  }

  getRoot(req, res) {
    this.models.courses.getAll()
      .then(courses => {
        res.render( 'courses', { courses } );
      });
  }

  getCreate(req, res) {
    this.models.users.getAll()
      .then(users => {
        res.render( 'create', { course: {}, users } );
      });
  }

  postCreate(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, 'The course requires a name', this.getRoute('/create'));
    }

    const course = {
      name: req.body.name
    }

    if ( parseInt( req.body.contact ) ) {
      course.contact_id = Number( req.body.contact );
    }

    this.models.courses.create(course)
      .then(ids => {
        req.flash('success', 'Course created');
        res.redirect(this.mountPath);
      })
      .catch(err => this.displayError(req, res, err, this.getRoute('/create'), 'Unable to create course – '));
  }

  getEdit(req, res) {
    Promise.all([
      this.models.users.getAll(),
      this.models.courses.lookup(['user']).getById(req.params.id)
    ])
      .then(([users , course]) => {
        if (!course) {
          throw new Error('Course not found');
        }

        res.render( 'edit', {
          course: course,
          users: users
        } );
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error editing - '));
  }

  postEdit(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, 'The course requires a name', this.getRoute());
    }

    const course = {
      name: req.body.name
    }

    if (parseInt(req.body.contact)) {
      course.contact_id = Number(req.body.contact);
    } else {
      course.contact_id = null;
    }

    this.models.courses.update(req.params.id, course)
      .then(ids => {
        req.flash('success', 'Course updated');
        res.redirect(this.mountPath);
      })
      .catch(err => this.displayError(req, res, err, this.getCreate(), 'Unable to update course – '));
  }

  getRemove(req, res) {
    this.models.courses.getAll()
      .then(courses => {
        const selectedCourse = courses.find(c => c.id === parseInt(req.params.id, 10));

        if (!selectedCourse) {
          throw new Error('Course not found');
        }

        const list = courses.map(course => {
          if (course.id == req.params.id) {
            return Object.assign({}, course, {
              disabled: true
            });
          }

          return course;
        });

        res.render( 'confirm-remove', {
          selected: selectedCourse,
          courses: list
        });
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute());
      });
  }

  postRemove(req, res) {
    let removeId;

    Promise.all([
      this.models.courses.query().getById(req.params.id),
      this.models.courses.query().getById(req.body.course)
    ])
      .then(([ courseToRemove, courseToBecome ]) => {
        if (!courseToBecome || !courseToRemove) {
          throw new Error('Course to remove/become not found');
        }

        removeId = courseToRemove.id;

        return { courseToRemove, courseToBecome };
      })
      .then(({ courseToRemove, courseToBecome }) => {
        return this.models.users.updateCourse(courseToRemove.id, courseToBecome.id)
      })
      .then(() => {
        return this.models.courses.remove(removeId)
          .then(() => {
            req.flash('success', 'Course deleted and users transferred');
            res.redirect(this.getRoute());
          });
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute(), 'Error removing - ');
      });
  }
};

module.exports = CoursesController;
