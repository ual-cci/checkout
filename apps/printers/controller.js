const BaseController = require('../../src/js/common/BaseController.js');

const Printers = require('../../src/models/printers');
const Users = require('../../src/models/users');

const config = require('./config.json');

class PrintersController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      users: new Users(),
      printers: new Printers(),
    };
  }

  getRoot(req, res) {
    this.models.printers.getAll()
      .then(printers => {
        res.render( 'printers', { printers } );
      });
  }

  getCreate(req, res) {
    res.render('create', { printer: {} });
  }

  postCreate(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, 'The printer requires a name', this.getRoute('/create'));
    }

    if (req.body.url == '') {
      this.displayError(req, res, 'The printer requires a URL', this.getRoute('/create'));
    }

    const values = {
      name: req.body.name,
      url: req.body.url
    };

    this.models.printers.create(values)
      .then(id => {
        req.flash('success', 'Printer created');
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error creating printer - '));
  }

  getEdit(req, res) {
    this.models.printers.getById(req.params.id)
      .then(printer => {
        if (!printer) {
          throw new Error('Printers not found');
        }
        res.render('edit', { printer });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  postEdit(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, 'The printer requires a name', this.getRoute(), '');
    }

    if (req.body.url == '') {
      this.displayError(req, res, 'The printer requires a URL', this.getRoute(), '');
    }

    const values = {
      name: req.body.name,
      url: req.body.url
    };
    this.models.printers.update(req.params.id, values)
      .then(id => {
        req.flash('success', 'Printer updated');
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  getRemove(req, res) {
    this.models.printers.getAll()
      .then(printers => {
        const selected = printers.find(i => i.id === parseInt(req.params.id, 10));

        if (!selected) {
          throw new Error('Printer not found');
        }

        const list = printers.map(printer => {
          if (printer.id == req.params.id) {
            return Object.assign({}, printer, {
              disabled: true
            });
          }

          return printer;
        });

        res.render('confirm-remove', {
          selected,
          printers: list
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  postRemove(req, res) {
    let removeId;
    this.models.printers.getById(req.params.id)
      .then(printerToRemove => {
        if (!printerToRemove) {
          throw new Error('Printer not found');
        }

        removeId = printerToRemove.id;

        if (req.body.printer) {
          return this.models.printers.query().getById(parseInt(req.body.printer, 10))
            .then(printerToBecome => {
              if (!printerToBecome) {
                throw new Error('New Printer not found');
              }

              return this.models.users.updatePrinter(printerToRemove.id, printerToBecome.id)
            });
        } else {
          return this.models.users.updatePrinter(printerToRemove.id, null);
        }
      })
      .then(() => {
        return this.models.printers.remove(removeId)
      })
      .then(() => {
        req.flash('success', 'Printer deleted and items transferred');
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error removing - '));
  }
};

module.exports = PrintersController;
