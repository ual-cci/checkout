const pug = require('pug');

const config = require('./config.json');
const BaseController = require('../../src/js/common/BaseController.js');
const auth = require('../../src/js/authentication');

const NewCourses = require('../../src/models//courses');
const NewUsers = require('../../src/models//users');
const NewYears = require('../../src/models//years');
const NewItems = require('../../src/models//items');
const NewActions = require('../../src/models//actions');
const NewPrinters = require('../../src/models//printers');

const { getSortBy } = require('../../src/js/utils.js');
const { STATUS, SORTBY_MUTATIONS } = require('../../src/js/common/constants');

class UsersController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      users: new NewUsers(),
      courses: new NewCourses(),
      years: new NewYears(),
      items: new NewItems(),
      actions: new NewActions(),
      printers: new NewPrinters(),
    };
  }

  getRoot(req, res) {
    let persist = {};

    Promise.all([
      this.models.courses.getAll(),
      this.models.years.getAll()
    ])
      .then(([courses, years]) => {
        const { orderBy, direction} = getSortBy(req.query.sortby, req.query.direction, {
          validSorts: ['name', 'course', 'year', 'barcode'],
          defaultSortby: 'name',
          mutator: SORTBY_MUTATIONS.USERS
        });

        persist = {
          ...persist,
          courses,
          years,
          orderBy,
          direction
        };

        return this.models.users.query()
          .lookup(['year', 'course', 'contact', 'printer'])
          .if((req.query.status), (query) => {
            let status;

            switch (req.query.status) {
              case STATUS.ACTIVE:
                status = 0;
                break;
              case STATUS.DISABLED:
                status = 1;
                break;
            }
            query.where('disable', status);
          })
          .if((req.query.course), (query) => {
            query.where('course_id', req.query.course);
          })
          .if((req.query.year), (query) => {
            query.where('year_id', req.query.year);
          })
          .orderBy([
            [orderBy, direction]
          ])
          .expose();
      })
      .then(users => {
        const { courses, years, orderBy, direction } = persist;

        res.render( 'users', {
          users,
          courses,
          years,
          selected: {
            status: req.query.status ? req.query.status : '',
            course: req.query.course ? req.query.course : '',
            year: req.query.year ? req.query.year : ''
          },
          sortby: req.query.sortby,
          direction: req.query.direction
        } );
      });
  }

  postEdit(req, res) {
    const singleItemCheck = (edit) => {
      if (!Array.isArray(edit)) {
        this.displayError(
          req,
          res,
          'Only one user was selected for group editing, use the single edit form',
          this.getRoute([`/${req.body.edit}`, '/edit'])
        );
      }
    }

    if (req.body.fields) {
      singleItemCheck(req.body.edit);

      const keys = ['course', 'year', 'status'];
      const values = ['course_id', 'year_id', 'disable'];
      const user = {}

      keys.forEach((k, index) => {
        if (req.body.fields.indexOf(k) >= 0 && req.body[k])
          user[values[index]] = req.body[k];
      });

      if ('disable' in user) {
        user.disable = user.disable == 'disabled' ? true : false;
      }

      this.models.users.updateMultiple(req.body.edit, user)
        .then(() => {
          req.flash('success', 'User updated');
          res.redirect(this.getRoute());
        })
        .catch(err => this.displayError(req, res, err, this.getRoute()));
    } else {
      let persist = {};

      Promise.all([
        this.models.years.getAll(),
        this.models.courses.getAll()
      ])
        .then(([years, courses]) => {
          singleItemCheck(req.body.edit);

          persist = {
            ...persist,
            years,
            courses
          };

          return this.models.users.query()
            .lookup(['course', 'year'])
            .orderBy([
              ['barcode', 'asc']
            ])
            .getMultipleByIds(req.body.edit)
        })
        .then(users => {
          const { years, courses } = persist;

          res.render('edit-multiple', {
            users,
            courses,
            years
          });
        })
        .catch(err => this.displayError(req, res, err, this.getRoute()));
    }
  }

  getUser(req, res) {
    let persist = {};
    this.models.users.query()
      .lookup(['printer', 'course', 'year', 'contact'])
      .getById(req.params.id)
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }

        persist = {
          ...persist,
          user
        };

        return Promise.all([
          this.models.items.getOnLoanByUserId(req.params.id),
          this.models.actions.getByUserId(req.params.id)
        ]);
      })
      .then(([items, actions]) => {
        const { user } = persist;
        const email = pug.renderFile(__dirname + '/views/email.pug', { name: user.name, items });
        res.render( 'user', {
          user,
          onloan: items,
          history: actions,
          email
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  getUserEdit(req, res) {
    let persist = {};

    this.models.users.query()
      .lookup(['printer', 'course', 'year'])
      .getById(req.params.id)
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }

        persist = {
          ...persist,
          user
        };

        return Promise.all([
          this.models.printers.getAll(),
          this.models.years.getAll(),
          this.models.courses.getAll()
        ]);
      })
      .then(([printers, years, courses]) => {
        const { user } = persist;

        res.render('edit', {
          courses,
          years,
          user,
          printers
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  postUserEdit(req, res) {
    const user = {
      name: req.body.name,
      barcode: req.body.barcode,
      email: req.body.email,
      course_id: req.body.course,
      year_id: req.body.year,
      printer_id: req.body.printer ? req.body.printer : null,
      type: req.body.type,
      disable: req.body.disable ? true : false
    };

    if (req.body.audit_point) {
      user.audit_point = new Date(req.body.audit_point);
    } else {
      user.audit_point = null;
    }

    auth.generatePassword(req.body.password, password => {
      if (req.body.password) {
        user.pw_hash = password.hash;
        user.pw_salt = password.salt;
        user.pw_iterations = password.iterations;
      }

      this.models.users.update(req.params.id, user)
        .then(id => {
          req.flash('success', 'User updated');
          res.redirect(this.getRoute(`/${req.params.id}`));
        })
        .catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)));
    } );
  }

  getUserRemove(req, res) {
    if (req.params.id == req.user.id) {
      this.displayError(req, res, 'You cannot delete the logged in user.', this.getRoute());
      return
    }

    let persist = {};

    this.models.users.getById(req.params.id)
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }

        persist = {
          ...persist,
          user
        };

        return this.models.items.getOnLoanByUserId(user.id);
      })
      .then(items => {
        if (items.length) {
          throw new Error('Users cannot be deleted if they have items on loan to them');
        }

        const { user } = persist;

        res.render( 'confirm-remove', {
          selected: user
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  postUserRemove(req, res) {
    if (req.params.id == req.user.id) {
      this.displayError(req, res, 'You cannot delete the logged in user.', this.getRoute());
      return
    }

    let persist = {};

    this.models.users.getById(req.params.id)
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }

        persist = {
          ...persist,
          user
        };

        return this.models.items.getOnLoanByUserId(user.id);
      })
      .then(items => {
        if (items.length) {
          throw new Error('Users cannot be deleted if they have items on loan to them');
        }

        const { user } = persist;

        return Promise.all([
          this.models.actions.removeByUserId(user.id),
          this.models.users.remove(user.id)
        ]);
      })
      .then(results => {
        req.flash('success', 'User and their history removed');
        res.redirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  getReset(req, res) {
    const user = {
      pw_attempts: 0
    };

    this.models.users.update(req.params.id, user)
      .then(id => {
        req.flash('success', 'Password attempts reset to zero');
        res.redirect(this.getRoute(`/${req.params.id}`));
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)));
  }
}

module.exports = UsersController;
