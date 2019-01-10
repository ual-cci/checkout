
const path = require('path');
const moment = require('moment');
const pug = require('pug');

const BaseController = require('../../src/js/common/BaseController.js');
const { AVAILABILITY, ACTIONS } = require('../../src/js/common/constants');
const config = require('./config.json');

const NewItems = require('../../src/models/new/items.js');
const NewDepartments = require('../../src/models/new/departments.js');
const NewGroups = require('../../src/models/new/groups.js');
const NewUsers = require('../../src/models/new/users.js');
const NewActions = require('../../src/models/new/actions.js');
const NewCourses = require('../../src/models/new/courses.js');

const Print = require('../../src/js/print');

class ApiController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      departments: new NewDepartments(),
      groups: new NewGroups(),
      items: new NewItems(),
      users: new NewUsers(),
      actions: new NewActions(),
      courses: new NewCourses(),
    };
  }

  getSearch(req, res) {
    const { term } = req.params;
    Promise.all([
      this.models.users.search(term),
      this.models.items.search(term)
    ])
      .then(([users, items]) => {
        res.json({
          query: term,
          users,
          items
        });
      });
  }

  getIdentify(req, res) {
    Promise.all([
      this.models.users.getByBarcode(req.params.term),
      this.models.items.getByBarcode(req.params.term)
    ])
      .then(([user, item]) => {
        if (user) {
          return {
            kind: 'user',
            barcode: user.barcode
          };
        }

        if (item) {
          return {
            kind: 'item',
            barcode: item.barcode
          };
        }

        return {
          kind: 'unknown'
        };
      })
      .then(result => {
        res.json(result);
      });
  }

  getUser(req, res) {
    let persist;

    this.models.users.query()
      .lookup(['course', 'year'])
      .getByBarcode(req.params.barcode)
      .then(user => {
        if (!user) {
          throw ({
            message: 'Unknown user'
          });
        }

        persist = {
          ...persist,
          user
        };

        return this.models.items.getOnLoanByUserId(user.id);
      })
      .then(items => {
        const { user } = persist;

        const html = pug.renderFile(path.join(__dirname, '../../src/views/modules/user.pug'), {
          user,
          onloan: items,
          moment: moment
        });

        var output = {
          type: 'user',
          id: user.id,
          barcode: user.barcode,
          name: user.name,
          email: user.email,
          course: user.course,
          html: html
        };

        return res.json( output );
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  getItem(req, res) {
    this.models.items.getByBarcode(req.params.barcode)
      .then(item => {
        if (!item) {
          throw ({
            message: 'Unknown item',
            barcode: req.params.barcode
          });
        }

        const html = pug.renderFile(path.join(__dirname, '../../src/views/modules/item.pug'), { item } );

        const output = {
          type: 'item',
          id: item.id,
          barcode: item.barcode,
          department: item.department_id,
          group: item.group_id,
          status: item.status,
          owner_id: item.owner_id,
          html: html
        };

        return res.json( output );
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  postAudit(req, res) {
    let persist = {};

    this.models.items.audit(req.params.item)
      .then(item => {
        persist.item = item;

        if (req.body.department) {
          return this.models.departments.getById(req.body.department)
            .then(department)
        }

        return false;
      })
      .then(department => {
        const { item } = persist;

        if (department) {
          return this.models.items.update(item.id, {
            department_id: department.id
          });
        }

        return false;
      })
      .catch(result => {
        const { item } = persist;

        res.json({
          status: 'success',
          message: 'Successfully audited',
          barcode: item.barcode
        });
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  postReturn(req, res) {
    let persist = {};
    this.models.items.return(req.params.item)
      .then(item => {
        persist.item = item;

        let action = ACTIONS.RETURNED;
        switch (item.status) {
          case AVAILABILITY.BROKEN:
            action = ACTIONS.REPAIRED;
            break;
          case AVAILABILITY.LOST:
            action = ACTIONS.FOUND;
            break;
        }

        return this.models.actions.create({
          item_id: item.id,
          action,
          operator_id: req.user.id
        });
      })
      .then(() => {
        const { item } = persist;
        return res.json({
          status: 'success',
          message: 'Successfully returned',
          barcode: item.barcode
        })
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  postBroken(req, res) {
    let persist = {};
    this.models.items.broken(req.params.item)
      .then(item => {
        persist.item = item;

        return this.models.actions.create({
          item_id: item.id,
          action: ACTIONS.BROKEN,
          operator_id: req.user.id
        });
      })
      .then(() => {
        return res.json({
          status: 'success',
          message: 'Successfully posted as broken',
          barcode: item.barcode
        });
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  postLost(req, res) {
    this.models.items.lost(req.params.item)
      .then(item => {
        return res.json({
          status: 'success',
          message: 'Successfully posted as lost',
          barcode: item.barcode
        });
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  postIssue(req, res) {
    Promise.all([
      this.models.users.getByBarcode(req.params.user),
      this.models.items.getByBarcode(req.params.item)
    ])
      .then(([user, item]) => {
        if (!user) {
          throw ({ message: 'Unknown user', barcode: req.params.user });
        }

        if (user.disable) {
          throw ({ message: 'User account has been disabled', barcode: user.barcode });
        }

        if (!item) {
          throw ({ message: 'Unknown item', barcode: req.params.item });
        }

        switch ( item.status ) {
          case AVAILABILITY.ON_LOAN:
            throw ({ message: 'Item already on loan', barcode: item.barcode });
          case AVAILABILITY.LOST:
            throw ({ message: 'Item is currently lost', barcode: item.barcode });
          case AVAILABILITY.BROKEN:
            throw ({ message: 'Item is currently broken', barcode: item.barcode });
        }

        return { user, item };
      })
      .then(({ user, item }) => {
        const result = { user, item };

        if ( item.group_id && item.group_limiter ) {
          return this.models.items.query()
            .where([
              ['owner_id', user.id],
              ['group_id', item.group_id]
            ])
            .expose()
            .then(items => {
              const count = items.length;

              if (count >= item.group_limiter && !req.query.override) {
                result.count = count;
              }

              return result;
            });
        } else {
          return result;
        }
      })
      .then(({ user, item ,count }) => {
        if (count) {
          throw ({
            message: `User already has ${ count } of this type of item out`,
            override: true,
            barcode: item.barcode
          });
        }

        return Promise.all([
          this.models.items.issue(item.id, user.id, req.user),
          this.models.actions.create({
            item_id: item.id,
            user_id: user.id,
            action: ACTIONS.ISSUED,
            operator_id: req.user.id
          })
        ]);
      })
      .then(([id, actionId]) => {
        res.json({
          message: 'Item issued',
          status: 'success'
        });
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  postLabel(req, res) {
    this.models.getByBarcode(req.params.item)
      .then(item => {
        if (!item) {
          throw ({
            message: 'Unknown item',
            barcode: req.params.item
          });
        }

        if (!req.user.printer_id) {
          throw ({
            message: 'You have not assigned a printer in your profile',
            barcode: item.barcode
          });
        }

        Print.label( {
          barcode: item.barcode,
          text: item.name,
          type: item.label
        }, req.user.printer_url );

        return res.json({
          status: 'success',
          message: `Label printed to ${req.user.printer_name}`,
          barcode: item.barcode
        });
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  postNewUser(req, res) {
    const cachedError = (err) => {
      return this.displayErrorJson(req, res, err);
    };

    if (!req.body.name) {
      return cachedError('The user must have a name');
    }

    if (!req.body.barcode) {
      return cachedError('The user must have a unique barcode');
    }

    if (!req.body.email) {
      return cachedError('The user must have an email address');
    }

    Promise.all([
      this.models.courses.getById(req.body.course),
      this.models.years.getById(req.body.year)
    ])
      .then(([course, year]) => {
        if (!course) {
          throw new Error('The user must be assigned to a course');
        }

        if (!year) {
          throw new Error('The user must be assigned to a year');
        }

        const user = {
          name: req.body.name,
          type: 'student',
          barcode: req.body.barcode,
          email: req.body.email,
          course_id: course.id,
          year_id: year.id
        }

        return this.models.users.create(user)
          .catch(err => {
            throw new ({
              message: err,
              redirect: {
                type: 'user',
                barcode: req.body.barcode
              }
            })
          });
      })
      .then(id => {
        return res.json({
          status: 'success',
          message: 'User created',
          redirect: {
            type: 'user',
            barcode: req.body.barcode
          }
        });
      })
      .catch(err => this.displayErrorJson(req, res, err));
  }

  getHistory(req, res) {
    this.models.actions.getDateRange(
      moment().startOf('day'),
      moment().endOf('day')
    )
      .then(actions => {
        const html = pug.renderFile(path.join(__dirname, '../../src/views/modules/history.pug'), {
          actions,
          moment: moment
        });

        res.json({
          actions: html
        });
      });
  }
};

module.exports = ApiController;
