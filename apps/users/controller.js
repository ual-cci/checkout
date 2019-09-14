const pug = require('pug');

const config = require('./config.json');
const BaseController = require('../../src/js/common/BaseController.js');
const auth = require('../../src/js/authentication');

const Courses = require('../../src/models/courses');
const Users = require('../../src/models/users');
const Years = require('../../src/models/years');
const Items = require('../../src/models/items');
const Actions = require('../../src/models/actions');
const Printers = require('../../src/models/printers');
const Roles = require('../../src/models/roles');

const { getSortBy } = require('../../src/js/utils.js');
const { STATUS, SORTBY_MUTATIONS } = require('../../src/js/common/constants');

class UsersController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      users: new Users(),
      courses: new Courses(),
      years: new Years(),
      items: new Items(),
      actions: new Actions(),
      printers: new Printers(),
      roles: new Roles(),
    };
  }

  getRoot(req, res) {
    let persist = {};

    Promise.all([
      this.models.roles.getAll(),
      this.models.courses.getAll(),
      this.models.years.getAll()
    ])
      .then(([roles, courses, years]) => {
        const { orderBy, direction} = getSortBy(req.query.sortby, req.query.direction, {
          validSorts: ['name', 'role', 'course', 'year', 'barcode'],
          defaultSortby: 'name',
          mutator: SORTBY_MUTATIONS.USERS
        });

        persist = {
          ...persist,
          roles,
          courses,
          years,
          orderBy,
          direction
        };

        return this.models.users.query()
          .lookup(['year', 'role', 'course', 'contact', 'printer'])
          .if((req.query.status), (query) => {
            let status;

            switch (req.query.status) {
              case STATUS.ACTIVE:
                status = false;
                break;
              case STATUS.DISABLED:
                status = true;
                break;
            }
            query.where('users.disable', status);
          })
          .if((req.query.role), (query) => {
            query.where('users.role_id', req.query.role);
          })
          .if((req.query.course), (query) => {
            query.where('users.course_id', req.query.course);
          })
          .if((req.query.year), (query) => {
            query.where('users.year_id', req.query.year);
          })
          .orderBy([
            [orderBy, direction]
          ])
          .expose();
      })
      .then(users => {
        const { roles, courses, years, orderBy, direction } = persist;

        res.render( 'index', {
          users,
          courses,
          years,
          roles,
          selected: {
            status: req.query.status ? req.query.status : '',
            course: req.query.course ? req.query.course : '',
            role: req.query.role ? req.query.role : '',
            year: req.query.year ? req.query.year : ''
          },
          sortby: req.query.sortby ? req.query.sortby : 'name',
          direction: req.query.direction ? req.query.direction : 'asc'
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
          this.getRoute([`/${edit}`, '/edit'])
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
          req.saveSessionAndRedirect(this.getRoute());
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

          var query = this.models.users.query()
            .getMultipleByIds(req.body.edit)

          var q2 = this.models.users.rewrap(query);
          q2.lookup(['course', 'year'])
            .orderBy([
              ['barcode', 'asc']
            ])

          return q2.retrieve()
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
      .lookup(['printer', 'role', 'course', 'year', 'contact'])
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
        res.render( 'single', {
          user,
          onloan: items,
          history: actions
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
          this.models.courses.getAll(),
          this.models.roles.getAll()
        ]);
      })
      .then(([printers, years, courses, roles]) => {
        const { user } = persist;

        res.render('edit', {
          courses,
          years,
          user,
          printers,
          roles
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
      disable: req.body.disable ? true : false
    };

    if (req.body.audit_point) {
      user.audit_point = new Date(req.body.audit_point);
    } else {
      user.audit_point = null;
    }

    if (req.body.role != undefined) {
      if (auth.userCan(req.user, 'users_change_role')) {
        if (req.body.role) {
          user.role_id = req.body.role;
        } else {
          user.role_id = null;
        }
      } else {
        req.flash('warning', 'You do not have permission to change another role.');
      }
    }

    auth.generatePassword(req.body.password?req.body.password:'', password => {
      if (req.body.password) {
        if (auth.userCan(req.user, 'users_change_password')) {
          user.pw_hash = password.hash;
          user.pw_salt = password.salt;
          user.pw_iterations = password.iterations;
        } else {
          req.flash('warning', 'You do not have permission to change another users password.');
        }
      }

      this.models.users.update(req.params.id, user)
        .then(id => {
          req.flash('success', 'User updated');
          req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`));
        })
        .catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)));
    } );
  }

  /**
   * Get import page with necessary data
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getImport(req, res) {
    res.render('import');
  }

  /**
   * Endpoint for processing the import of users
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postImportProcess(req, res) {
    return;
    var data;
    var format;
    if (req.body.format == 'tsv') format = "\t";
    if (req.body.format == 'csv') format = ',';

    if (req.body.data) {
      data = req.body.data.trim().split('\r\n')
      data = data.map(d => d.split(format))
    } else {
      req.flash('danger', 'No data provided')
      req.saveSessionAndRedirect(this.getRoute());
      return;
    }

    Promise.all([
      this.models.locations.getAll(),
      this.models.departments.getAll(),
      this.models.groups.getAll()
    ])
    .then(([locations, departments, groups]) => {
      if (locations.length > 0) {
        res.render( 'process', { locations: locations, departments: departments, groups: groups, data: data } );
      } else {
        req.flash( 'warning', 'Create at least one location before creating items' )
        req.saveSessionAndRedirect(this.getRoute());
      }
    });
  }

  /**
   * Endpoint for importing processed user data
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postImportData(req, res) {
    return;
    // Check for location and department
    const checks = [
      {
        condition: (req.body.location == ''),
        message: 'The items must be assigned to a location'
      },
      {
        condition: (req.body.department == ''),
        message: 'The items must be assigned to a department'
      }
    ];
    this._checkFields(checks, '/generate', req, res);

    var items = [];
    var barcodes = [];

    var location_id = req.body.location;
    var group_id = req.body.group;

    // Test if there are duplicate column headings.
    if (new Set(req.body.cols).size !== req.body.cols.length) {
      req.flash('danger', 'Each heading may only be used once.');
      req.saveSessionAndRedirect(this.getRoute());
      return;
    }

    this.models.departments.getById(req.body.department)
      .then((department) => {
        // Map heading order
        const expectedHeadings = ['name','value','label','barcode','serialnumber','notes'];
        var headingMap = {};
        expectedHeadings.forEach(head => {
          headingMap[head] = req.body.cols.indexOf(head);
        })

        // Process data into item objects.
        req.body.items.forEach(data => {
          var item = {
            name: data[headingMap.name],
            barcode: data[headingMap.barcode],
            label: data[headingMap.label],
            value: parseFloat(data[headingMap.value]),
            location_id: location_id,
            department_id: department.id,
            serialnumber: data[headingMap.serialnumber],
            notes: data[headingMap.notes],
            status: AVAILABILITY.AVAILABLE
          }

          if (!item.value) {
            item.value = 0.0
          }

          if ( group_id ) {
            item.group_id = group_id;
          }
          items.push(item);
          barcodes.push({
            barcode: item.barcode,
            text: item.name,
            type: item.label,
            brand: department.brand
          });
        })
      })
      .then(() => {
        this.models.items.create(items)
          .then(result => {
            console.log(items)
            req.flash('success', 'Items imported');
            if (req.body.print) {
              if (req.user.printer_id) {
                Print.labels(barcodes, req.user.printer_url);
                req.flash('info', `Labels printed to ${req.user.printer_name}`);
              } else {
                req.flash('warning', 'No printer configured');
              }
            }
            req.saveSessionAndRedirect(this.getRoute());
          })
          .catch(err => this.displayError(req, res, err, this.getRoute('/import')));
      });
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
        req.saveSessionAndRedirect(this.getRoute());
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
        req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`));
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)));
  }

  getEmail(req, res) {
    let persist = {};
    this.models.users.query()
      .lookup(['course','contact'])
      .getById(req.params.id)
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }

        persist = {
          ...persist,
          user
        };

        return this.models.items.getOnLoanByUserId(req.params.id);
      })
      .then((items) => {
        if (items.length < 1) {
          req.flash('warning', 'This user has no items on loan to email about');
          req.saveSessionAndRedirect(this.getRoute());
          return;
        }
        const { user } = persist;
        var email = `Hello ${user.name},\n\nYou currently have the following item${items.length > 1 ? 's' : ''} on loan which ${items.length > 1 ? 'are' : 'is'} due back:\n\n`;
        for (var i in items) {
          var item = items[i];
          email += ` ∙ ${item.name} (${item.barcode})\n`;
        }
        res.render( 'email', {
          user,
          email
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }


}

module.exports = UsersController;
