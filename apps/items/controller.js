const BaseController = require('../../src/js/common/BaseController.js');

const NewItems = require('../../src/models/new/items.js');
const NewGroups = require('../../src/models/new/groups.js');
const NewDepartments = require('../../src/models/new/departments.js');
const NewCourses = require('../../src/models/new/courses.js');
const NewYears = require('../../src/models/new/years.js');
const NewPrinters = require('../../src/models/new/printers.js');
const NewActions = require('../../src/models/new/actions.js');

// TODO
const Print = require('../../src/js/print');
const { getSortBy } = require('../../src/js/utils.js');
const { AVAILABILITY } = require('../../src/js/common/constants');

const config = require('./config.json');

class ItemController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      items: new NewItems(),
      groups: new NewGroups(),
      departments: new NewDepartments(),
      courses: new NewCourses(),
      years: new NewYears(),
      printers: new NewPrinters(),
      actions: new NewActions(),
    };
  }

  _checkFields(checks, redirect, req, res) {
    for (let i = 0; i < checks.length; i++) {
      if (checks[i].condition) {
        req.flash('danger', checks[i].message);
        res.redirect(this.getRoute(redirect));
        break;
      }
    }
  }

  getHome(req, res) {
    Promise.all([
      this.models.groups.getAll(),
      this.models.departments.getAll(),
      this.models.courses.getAll(),
      this.models.years.getAll()
    ])
      .then(([groups, departments, courses, years]) => {
        const selected = {
          status: req.query.status ? req.query.status : '',
          department: req.query.department ? req.query.department : '',
          group: req.query.group ? req.query.group : '',
          course: req.query.course ? req.query.course : '',
          year: req.query.year ? req.query.year : ''
        };

        if (Object.keys(req.query).length == 0) {
          res.render('items', {
            items: null,
            departments,
            groups,
            courses,
            years,
            selected
          });
        } else {
          const { orderBy, direction } = getSortBy(req.query.sortby, req.query.direction);

          // Get items
          this.models.items.query()
            .if((req.query.status), (query) => {
              query.where('status', req.query.status);
            })
            .if((req.query.course), query => {
              query.where('course.id', req.query.course);
            })
            .if((req.query.year), query => {
              query.where('years.id', req.query.year);
            })
            .if((req.query.group), query => {
              query.where('group_id', req.query.group);
            })
            .if((req.query.department), query => {
              query.where('department_id', req.query.department);
            })
            .orderBy([
              [ orderBy, direction ]
            ])
            .expose()
            .then(items => {
              res.render( 'items', {
                items,
                departments,
                groups,
                courses,
                years,
                selected,
                sortby: orderBy,
                direction
              });
            });
        }
      });
  }

  postEdit(req, res) {
    const singleItemCheck = (edit) => {
      if (!Array.isArray(edit)) {
        this.displayError(
          req,
          res,
          'Only one item was selected for group editing, use the single edit form',
          this.getRoute([`/${req.body.edit}`, '/edit'])
        );
      }
    };

    if (req.body.fields) {
      singleItemCheck(req.body.edit);

      const keys = ['label', 'group', 'department', 'notes', 'value'];
      const values = ['label', 'group_id', 'department_id', 'notes', 'value'];
      const item = {}

      keys.forEach((k, index) => {
        if (req.body.fields.indexOf(k) >= 0 && req.body[k])
          item[values[index]] = req.body[k];
      });

      this.models.items.updateMultiple(req.body.edit, item)
        .then(result => {
          req.flash('success', 'Items updated');
          res.redirect(this.getRoute());
        })
        .catch(err => {
          this.displayError(req, res, err, this.getRoute());
        });
    } else {
      Promise.all([
        this.models.groups.getAll(),
        this.models.departments.getAll()
      ])
        .then(([groups, departments]) => {
          singleItemCheck(req.body.edit);

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
                departments
              });
            });
        });
    }
  }

  getGenerate(req, res) {
    Promise.all([
      this.models.departments.getAll(),
      this.models.groups.getAll()
    ])
      .then(([departments, groups]) => {
        if (departments.length > 0) {
          req.flash( 'warning', 'Generating items cannot be undone, and can cause intense server load and result in generating large numbers of items that have invalid information' )
          res.render( 'generate', { departments: departments, groups: groups, item: {} } );
        } else {
          req.flash( 'warning', 'Create at least one department before creating items' )
          res.redirect(this.getRoute());
        }
      });
  }

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
        condition: (req.body.department == ''),
        message: 'The items must be assigned to a department'
      }
    ];

    this._checkFields(checks, '/generate', req, res);

    const items = [];
    const barcodes = [];

    for (let i = start; i <= end; i++) {
      let item = {
        name: req.body.name.trim(),
        barcode: req.body.prefix,
        label: req.body.label,
        value: req.body.value,
        department_id: req.body.department,
        notes: req.body.notes,
        status: AVAILABILITY.AVAILABLE
      }

      if ( req.body.group )
        item.group_id = req.body.group;

      const index = i.toString().padStart(2, '0');
      if (req.body.suffix) item.name += " #" + index;
      item.barcode += index.toString();
      barcodes.push({
        barcode: item.barcode,
        text: item.name,
        type: item.label
      });
      items.push(item);
    }

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
        res.redirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute('/generate')));
  }

  getCreate(req, res) {
    Promise.all([
      this.models.departments.getAll(),
      this.models.groups.getAll()
    ])
      .then(([departments, groups]) => {
        if (departments.length > 0) {
          res.render( 'create', { item: null, departments, groups } );
        } else {
          req.flash( 'warning', 'Create at least one department before creating items' )
          res.redirect(this.getRoute());
        }
      });
  }

  postCreate(req, res) {
    const item = {
      name: req.body.name,
      barcode: req.body.barcode,
      label: req.body.label,
      value: req.body.value,
      department_id: req.body.department,
      notes: req.body.notes,
      status: AVAILABILITY.AVAILABLE
    }

    if ( req.body.group )
      item.group_id = req.body.group;

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
        condition: (!item.department_id),
        message: 'The item must be assigned to a department'
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
              type: item.label
            }, req.user.printer_url );
            req.flash('info', `Label printed to ${req.user.printer_name}`);
          } else {
            req.flash('warning', 'No printer configured');
          }
        }
        res.redirect(this.getRoute());
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute('/create'), 'Error creating item - ');
      });
  }

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
        res.render('item', {
          item: _item,
          printers: _printers,
          history
        });
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute());
      });
  }

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
          type: _item.label
        }, printer.url );

        req.flash( 'info', `Label printed to ${printer.name}`);
        if (req.get('referer') && req.get('referer').indexOf(`items/${req.params.id}`) < 0) {
          res.redirect(this.getRoute());
        } else {
          res.redirect(this.getRoute(`/${_item.id.toString()}`));
        }
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute());
      });
  }

  getMulti(req, res) {
    this.models.getMultipleById(req.body.ids.split(','))
      .then(items => {
        const barcodes = items.map(item => {
          return {
            barcode: item.barcode,
            text: item.name,
            type: item.label
          };
        });

        Print.labels(barcodes, req.user.printer_url);

        req.flash( 'success', "Printed those labels" );
        res.redirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  getEdit(req, res) {
    Promise.all([
      this.models.items.getById(req.params.id),
      this.models.groups.getAll(),
      this.models.departments.getAll()
    ])
      .then(([item, groups, departments]) => {
        if (!item) {
          throw new Error('Item not found');
        }

        res.render('edit', {
          item,
          groups,
          departments
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  postEdit(req, res) {
    const item = {
      name: req.body.name,
      barcode: req.body.barcode,
      label: req.body.label,
      department_id: req.body.department,
      value: req.body.value,
      notes: req.body.notes
    };

    if (req.body.group != '') {
      item.group_id = req.body.group;
    }

    this.models.items.update(req.params.id, item)
      .then(result => {
        req.flash( 'success', 'Item updated' );

        if (req.body.print) {
          if (req.user.printer_id) {
            Print.label( {
              barcode: item.barcode,
              text: item.name,
              type: item.label
            }, req.user.printer_url );
            req.flash( 'info', `Label reprinted to ${req.user.printer_name}`);
          } else {
            req.flash( 'warning', 'No printer configured' );
          }
        }

        res.redirect(this.getRoute(`/${req.params.id}`));
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(`/${req.params.id}`)));
  }

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
        res.redirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }
}

module.exports = ItemController;
