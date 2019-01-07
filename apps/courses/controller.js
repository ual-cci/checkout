const NewCourses = require('../../src/models/new/courses.js');
const NewUsers = require('../../src/models/new/users.js');

class CoursesController {
  constructor(mountPath) {
    this.mountPath = mountPath;

    this.models = {
      courses: new NewCourses(),
      users: new NewUsers()
    };
  }

  getHome(req, res) {
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
    if ( req.body.name == '' ) {
      req.flash( 'danger', 'The course requires a name' );
      res.redirect(`${this.mountPath}/create`);
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
      .catch(err => {
        req.flash('danger', `Unable to create course – ${err}`);
        res.redirect(this.mountPath);
      });
  }

  getEdit(req, res) {
    Promise.all([
      this.models.users.getAll(),
      this.models.courses.lookup(['user']).getById(req.params.id)
    ])
      .then(results => {
        const users = results[0];
        const course = results[1];

        if ( course == undefined ) {
          req.flash( 'danger', 'Course not found' );
          res.redirect(this.mountPath);
        } else {
          res.render( 'edit', {
            course: course,
            users: users
          } );
        }
      });
  }

  postEdit(req, res) {
    if ( req.body.name == '' ) {
      req.flash( 'danger', 'The course requires a name' );
      res.redirect(`${this.mountPath}/create`);
    }

    var course = {
      name: req.body.name
    }

    if ( parseInt( req.body.contact ) ) {
      course.contact_id = Number(req.body.contact);
    } else {
      course.contact_id = null;
    }

    this.models.courses.update(req.params.id, course)
      .then(ids => {
        req.flash('success', 'Course updated');
        res.redirect(this.mountPath);
      })
      .catch(err => {
        req.flash('danger', `Unable to update course – ${err}`);
        res.redirect(this.mountPath);
      });
  }

  getRemove(req, res) {
    this.models.courses.getAll()
      .then(courses => {
        const selectedCourse = courses.find(c => c.id === parseInt(req.params.id, 10));

        const list = courses.map(course => {
          if (course.id == req.params.id) {
            return Object.assign({}, course, {
              disabled: true
            });
          }

          return course;
        });

        if (selectedCourse) {
          res.render( 'confirm-remove', {
            selected: selectedCourse,
            courses: list
          } );
        } else {
          req.flash( 'danger', 'Course not found' );
          res.redirect(this.mountPath);
        }
      });
  }

  postRemove(req, res) {
    Promise.all([
      this.models.courses.query().getById(req.params.id),
      this.models.courses.query().getById(req.body.course)
    ])
      .then(([ courseToRemove, courseToBecome ]) => {
        if (!courseToBecome || !courseToRemove) {
          req.flash( 'danger', 'Course to remove/become not found' );
          res.redirect(this.mountPath);
        }

        return { courseToRemove, courseToBecome };
      })
      .then(({ courseToRemove, courseToBecome }) => {
        this.models.users.updateCourse(courseToRemove.id, courseToBecome.id)
          .then(id => {
            coursesModel.remove(courseToRemove.id)
              .then(() => {
                req.flash( 'success', 'Course deleted and users transferred' );
                res.redirect(this.mountPath);
              })
              .catch(err => {
                req.flash( 'danger', 'Could not transfer users to new course' );
                res.redirect(this.mountPath);
              });
          })
          .catch(err => {
            req.flash( 'danger', `Could not transfer users to new course – ${err}` );
            res.redirect(this.mountPath);
          });
      });
  }
};

module.exports = CoursesController;
