const BaseController = require('../../src/js/common/BaseController.js');

const Items = require('../../src/models/items.js');
const Groups = require('../../src/models/groups.js');
const Locations = require('../../src/models/locations.js');
const Departments = require('../../src/models/departments.js');
const Courses = require('../../src/models/courses.js');
const Years = require('../../src/models/years.js');
const Printers = require('../../src/models/printers.js');
const Actions = require('../../src/models/actions.js');

// TODO
const Print = require('../../src/js/print');
const { getSortBy } = require('../../src/js/utils.js');
const { AVAILABILITY, SORTBY_MUTATIONS } = require('../../src/js/common/constants');

const moment = require('moment');

const config = require('./config.json');

class ItemController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      items: new Items(),
      groups: new Groups(),
      locations: new Locations(),
      departments: new Departments(),
      courses: new Courses(),
      years: new Years(),
      printers: new Printers(),
      actions: new Actions(),
    };
  }

  /**
   * Cycles through an array of conditions and if any are matched
   * to redirect with an error
   *
   * @param {Array} checks Object array of shape { message, condition }
   * @param {String} redirect Endpoint to redirect to
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  _checkFields(checks, redirect, req, res) {
    for (let i = 0; i < checks.length; i++) {
      if (checks[i].condition) {
        this.displayError(req, res, checks[i].message, this.getRoute(redirect));
        break;
      }
    }
  }

  /**
   * Builds the data necessary for the home page
   * with the relevant ordering inferred by the query
   * parameters
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getRoot(req, res) {
    Promise.all([
      this.models.groups.getAll(),
      this.models.locations.getAll(),
      this.models.departments.getAll(),
      this.models.courses.getAll(),
      this.models.years.getAll()
    ])
      .then(([groups, locations, departments, courses, years]) => {
        const selected = {
          status: req.query.status ? req.query.status : '',
          location: req.query.location ? req.query.location : '',
          department: req.query.department ? req.query.department : '',
          group: req.query.group ? req.query.group : '',
          course: req.query.course ? req.query.course : '',
          year: req.query.year ? req.query.year : '',
          due: req.query.due ? req.query.due : '',
          audited: req.query.audited ? req.query.audited : '',
          scanned: req.query.scanned ? req.query.scanned : '',
        };
        const { orderBy, direction } = getSortBy(req.query.sortby, req.query.direction, {
          mutator: SORTBY_MUTATIONS.ITEMS
        });

        // Get items
        this.models.items.query()
          // Section of if commands to add queries into query
          .if((req.query.status), (query) => {
            query.where('status', req.query.status);
          })
          .if((req.query.course), query => {
            query.where('courses.id', req.query.course);
          })
          .if((req.query.year), query => {
            query.where('years.id', req.query.year);
          })
          .if((req.query.group), query => {
            query.where('group_id', req.query.group);
          })
          .if((req.query.location), query => {
            query.where('location_id', req.query.location);
          })
          .if((req.query.department), query => {
            query.where('department_id', req.query.department);
          })
          .if((req.query.due), (query) => {
            if (req.query.due == 'overdue') query.where('due', '<=', new Date());
            if (req.query.due == 'future') query.where('due', '>', new Date());
            if (req.query.due == 'today') query.whereBetween('due', [moment().startOf('day').toDate(), moment().endOf('day').toDate()]);
            if (req.query.due == 'thisweek') query.whereBetween('due', [moment().startOf('week').toDate(), moment().endOf('week').toDate()]);
            if (req.query.due == 'thismonth') query.whereBetween('due', [moment().startOf('month').toDate(), moment().endOf('month').toDate()]);
          })
          .if((req.query.audited), (query) => {
            const audit_point = req.user.audit_point ? moment(req.user.audit_point) : moment().startOf('day');
            var direction = '>=';
            if ( req.query.scanned == 'false' ) direction = '<';
            if (req.query.audited == 'auditpoint') query.where('audited', direction, audit_point);
            if (req.query.audited == 'today') query.where('audited', direction, moment().startOf('day').toDate() );
            if (req.query.audited == 'thisweek') query.where('audited', direction, moment().startOf('week').toDate() );
            if (req.query.audited == 'thismonth') query.where('audited', direction, moment().startOf('month').toDate() );
            if (req.query.scanned == 'false' ) query.orWhere('audited', null);
          })
          .orderBy([
            [ orderBy, direction ]
          ])
          .expose()
          .then(items => {
            res.render( 'index', {
              items,
              locations,
              departments,
              groups,
              courses,
              years,
              selected,
              sortby: orderBy,
              direction
            });
          });
      });
  }

  /**
   * Endpoint for both displaying and posting data for
   * multi item edit.
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postMultiEdit(req, res) {
    // If the ID passed is singular, redirect
    // to the single edit form
    const singleItemCheck = (edit) => {
      if (!Array.isArray(edit)) {
        this.displayError(
          req,
          res,
          'Only one item was selected for group editing, use the single edit form',
          this.getRoute([`/${edit}`, '/edit'])
        );
      }
    }

    // Checks if its a request with data
    if (req.body.fields) {
      singleItemCheck(req.body.edit);

      const keys = ['label', 'group', 'location', 'department', 'notes', 'value', 'serialnumber'];
      const values = ['label', 'group_id', 'location_id', 'department_id', 'notes', 'value', 'serialnumber'];
      const item = {};

      keys.forEach((k, index) => {
        if (req.body.fields.indexOf(k) >= 0 && req.body[k])
          item[values[index]] = req.body[k];
      });

      this.models.items.updateMultiple(req.body.edit, item)
        .then(result => {
          req.flash('success', 'Items updated');
          req.saveSessionAndRedirect(this.getRoute());
        })
        .catch(err => {
          this.displayError(req, res, err, this.getRoute());
        });
    } else {
      Promise.all([
        this.models.groups.getAll(),
        this.models.locations.getAll(),
        this.models.departments.getAll()
      ])
        .then(([groups, locations, departments]) => {

          this.models.items.query()
            .orderBy([
              ['barcode', 'asc']
            ])
            .expose()
            .whereIn('items.id', req.body.edit)
            .then(items => {
              res.render('edit-multiple', {
                items,
                groups,
                locations,
                departments
              });
            });
        });
    }
  }

  /**
   * Get generate page with necessary data
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getGenerate(req, res) {
    Promise.all([
      this.models.locations.getAll(),
      this.models.departments.getAll(),
      this.models.groups.getAll()
    ])
      .then(([locations, departments, groups]) => {
        if (locations.length > 0) {
          req.flash( 'warning', 'Generating items cannot be undone, and can cause intense server load and result in generating large numbers of items that have invalid information' )
          res.render( 'generate', { locations: locations, departments: departments, groups: groups, item: {} } );
        } else {
          req.flash( 'warning', 'Create at least one location before creating items' )
          req.saveSessionAndRedirect(this.getRoute());
        }
      });
  }

  /**
   * Endpoint for posting the generation of items
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postGenerate(req, res) {
    const start = parseInt( req.body.start );
    const end = (start + parseInt(req.body.qty)) - 1;

    const checks = [
      {
        condition: (req.body.name == ''),
        message: 'The items require a name'
      },
      {
        condition: (req.body.prefix == ''),
        message: 'The items require a barcode prefix'
      },
      {
        condition: (req.body.prefix.length < 3 == null),
        message: 'The barcode prefix must be longer than 2 characters.'
      },
      {
        condition: (start == '' || start < 1),
        message: 'The item numbering must start at 1 or above'
      },
      {
        condition: (end > 25 && ! req.body.largeBatch),
        message: 'You can\'t generate more than 25 items at a time without confirming you want to do this'
      },
      {
        condition: (req.body.location == ''),
        message: 'The items must be assigned to a location'
      }
    ];

    this._checkFields(checks, '/generate', req, res);

    const items = [];
    const barcodes = [];

    this.models.departments.getById(req.body.department)
      .then((department) => {
        for (let i = start; i <= end; i++) {
          let item = {
            name: req.body.name.trim(),
            barcode: req.body.prefix,
            label: req.body.label,
            value: req.body.value,
            location_id: req.body.location,
            department_id: req.body.department,
            notes: req.body.notes,
            status: AVAILABILITY.AVAILABLE
          }

          if (!req.body.value) {
            item.value = 0.0
          }

          if ( req.body.group )
            item.group_id = req.body.group;

          const index = i.toString().padStart(2, '0');
          if (req.body.suffix) item.name += " #" + index;
          item.barcode += index.toString();
          barcodes.push({
            barcode: item.barcode,
            text: item.name,
            type: item.label,
            brand: department.name
          });
          items.push(item);
        }
      })
      .then(() => {
        this.models.items.create(items)
          .then(result => {
            req.flash( 'success', 'Items created' );

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
          .catch(err => this.displayError(req, res, err, this.getRoute('/generate')));
      });
  }

  /**
   * Gets the data for a create page
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getCreate(req, res) {
    Promise.all([
      this.models.locations.getAll(),
      this.models.departments.getAll(),
      this.models.groups.getAll()
    ])
      .then(([locations, departments, groups]) => {
        if (locations.length > 0) {
          res.render( 'create', { item: null, locations, departments, groups } );
        } else {
          req.flash( 'warning', 'Create at least one location before creating items' )
          req.saveSessionAndRedirect(this.getRoute());
        }
      });
  }

  /**
   * Endpoint for creating an item
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postCreate(req, res) {
    this.models.departments.getById(req.body.department)
      .then((department) => {
      const item = {
        name: req.body.name,
        barcode: req.body.barcode,
        label: req.body.label,
        value: req.body.value,
        location_id: req.body.location,
        department_id: req.body.department,
        notes: req.body.notes,
        serialnumber: req.body.serialnumber,
        status: AVAILABILITY.AVAILABLE
      }

      if (!req.body.value) {
        item.value = 0.0
      }

      if (req.body.group) {
        item.group_id = req.body.group;
      }

      const checks = [
        {
          condition: (item.name == ''),
          message: 'The item requires a name'
        },
        {
          condition: (item.barcode == ''),
          message: 'The item requires a unique barcode'
        },
        {
          condition: (!item.location_id),
          message: 'The item must be assigned to a location'
        }
      ];

      this._checkFields(checks, '/create', req, res);

      this.models.items.create(item)
        .then(id => {
          req.flash('success', 'Item created');

          if (req.body.print) {
            if (req.user.printer_id) {
              Print.label( {
                barcode: item.barcode,
                text: item.name,
                type: item.label,
                brand: department.brand
              }, req.user.printer_url );
              req.flash('info', `Label printed to ${req.user.printer_name}`);
            } else {
              req.flash('warning', 'No printer configured');
            }
          }
          req.saveSessionAndRedirect(this.getRoute());
        })
        .catch(err => {
          this.displayError(req, res, err, this.getRoute('/create'), 'Error creating item - ');
        });
      });
  }

  /**
   * Gets the item and the associated action history
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getItem(req, res) {
    let _printers;
    let _item;

    Promise.all([
      this.models.printers.getAll(),
      this.models.items.getById(req.params.id)
    ])
      .then(([printers, item]) => {
        if (!item) {
          throw new Error('Item not found');
        }

        _printers = printers;
        _item = item;

        return this.models.actions.getByItemId(item.id);
      })
      .then(history => {
        res.render('single', {
          item: _item,
          printers: _printers,
          history
        });
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute());
      });
  }

  /**
   * Gets a label for a given item and prints it
   * using either the specified printer or the
   * user's printer
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getLabel(req, res) {
    let _item;
    this.models.items.getById(req.params.id)
      .then(item => {
        if (!item) {
          throw new Error('Item not found');
        }

        _item = item;

        const printerId = req.query.printer || req.user.printer_id;

        if (!printerId) {
          throw new Error('No printer selected');
        }

        return this.models.printers.getById(printerId);
      })
      .then(printer => {
        if (!printer) {
          throw new Error('Invalid printer');
        }

        Print.label( {
          barcode: _item.barcode,
          text: _item.name,
          type: _item.label,
          brand: _item.department_brand
        }, printer.url );

        req.flash( 'info', `Label printed to ${printer.name}`);
        if (req.get('referer') && req.get('referer').indexOf(`items/${req.params.id}`) < 0) {
          req.saveSessionAndRedirect(this.getRoute());
        } else {
          req.saveSessionAndRedirect(this.getRoute(`/${_item.id.toString()}`));
        }
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute());
      });
  }

  /**
   * Prints multiple labels at once
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getMulti(req, res) {
    this.models.items.getMultipleByIds(req.body.ids.split(','))
      .then(items => {
        const barcodes = items.map(item => {
          return {
            barcode: item.barcode,
            text: item.name,
            type: item.label,
            brand: item.department_brand
          };
        });

        Print.labels(barcodes, req.user.printer_url);

        req.flash( 'success', "Printed those labels" );
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  /**
   * Gets the edit page for a given item
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getEdit(req, res) {
    Promise.all([
      this.models.items.getById(req.params.id),
      this.models.groups.getAll(),
      this.models.locations.getAll(),
      this.models.departments.getAll()
    ])
      .then(([item, groups, locations, departments]) => {
        if (!item) {
          throw new Error('Item not found');
        }

        res.render('edit', {
          item,
          groups,
          locations,
          departments
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  /**
   * Posts the edits made to an item
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postEdit(req, res) {
    const item = {
      name: req.body.name,
      barcode: req.body.barcode,
      label: req.body.label,
      location_id: req.body.location,
      value: req.body.value,
      notes: req.body.notes,
      serialnumber: req.body.serialnumber
    };

    if (!req.body.value) {
      item.value = 0.0
    }

    if (req.body.group != '') {
      item.group_id = req.body.group;
    }

    if (req.body.department != '') {
      item.department_id = req.body.department;
    }

    this.models.items.update(req.params.id, item)
      .then(result => {
        req.flash( 'success', 'Item updated' );

        if (req.body.print) {
          if (req.user.printer_id) {
            Print.label( {
              barcode: item.barcode,
              text: item.name,
              type: item.label,
              brand: item.department_brand
            }, req.user.printer_url );
            req.flash( 'info', `Label reprinted to ${req.user.printer_name}`);
          } else {
            req.flash( 'warning', 'No printer configured' );
          }
        }

        req.saveSessionAndRedirect(this.getRoute(`/${req.params.id}`));
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)));
  }

  /**
   * Gets the remove page for an item
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getRemove(req, res) {
    this.models.items.getById(req.params.id)
      .then(item => {
        if (!item) {
          throw new Error('Item not found');
        }

        res.render('confirm-remove', {
          selected: item
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  /**
   * Endpoint for removing an item
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postRemove(req, res) {
    let _item;
    this.models.items.getById(req.params.id)
      .then(item => {
        if (!item) {
          throw new Error('Item not found');
        }

        _item = item;

        return this.models.actions.removeByItemId(item.id);
      })
      .then(() => {
        return this.models.items.remove(_item.id);
      })
      .then(() => {
        req.flash( 'success', "Item and it's history removed" );
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }
}

module.exports = ItemController;
