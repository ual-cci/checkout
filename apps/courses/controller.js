const NewCourses = require('../../src/models/new/courses.js');
const NewUsers = require('../../src/models/new/users.js');

class CoursesController {
  constructor(mountPath) {
    this.mountPath = mountPath;
  }

  getHome(req, res) {
    const coursesModel = new NewCourses();
    coursesModel.getAll()
      .then(courses => {
        res.render( 'courses', { courses } );
      });
  }

  getCreate(req, res) {
    const usersModel = new NewUsers();
    usersModel.getAll()
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

    const coursesModel = new NewCourses();
    coursesModel.create(course)
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
    const usersModel = new NewUsers();
    const coursesModel = new NewCourses();

    Promise.all([
      usersModel.getAll(),
      coursesModel
        .lookup(['user'])
        .where([
          ['id', req.params.id]
        ])
        .returnSingle()
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
    const coursesModel = new NewCourses();

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

    coursesModel.update(req.params.id, course)
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
    const coursesModel = new NewCourses();

    coursesModel.getAll()
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
    const coursesModel = new NewCourses();
    const usersModel = new NewUsers();

    Promise.all([
      coursesModel.query()
        .where([['id', req.params.id]])
        .returnSingle(),
      coursesModel.query()
        .where([['id', req.body.course]])
        .returnSingle()
    ])
      .then(([ courseToRemove, courseToBecome ]) => {
        if (!courseToRemove) {
          req.flash( 'danger', 'Course to remove not found' );
          res.redirect(this.mountPath);
          return;
        }

        if (!courseToBecome) {
          req.flash( 'danger', 'New course not found' );
          res.redirect(this.mountPath);
          return;
        }

        return { courseToRemove, courseToBecome };
      })
      .then(({ courseToRemove, courseToBecome }) => {
        usersModel.updateCourse(courseToRemove.id, courseToBecome.id)
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
