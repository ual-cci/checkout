const BaseController = require('../../src/js/common/BaseController.js');

const Years = require('../../src/models/years.js');
const Users = require('../../src/models/users.js');

const config = require('./config.json');

class YearsController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      years: new Years(),
      users: new Users()
    };
  }

  getRoot(req, res) {
    this.models.years.getAll()
      .then(years => {
        res.render('years', { years });
      });
  }

  getCreate(req, res) {
    res.render('create');
  }

  postCreate(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, '', this.getRoute('/create'), 'The year requires a name');
    }

    const year = {
      name: req.body.name
    }

    this.models.years.create(year)
      .then(id => {
        req.flash( 'success', 'Year created' );
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error creating year - '));
  }

  getEdit(req, res) {
    this.models.years.getById(req.params.id)
      .then(year => {
        if (!year) {
          throw new Error('Could not find year');
        } else {
          res.render('edit', { year });
        }
      })
      .catch(err => this.displayError(req, res, err));
  }

  postEdit(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, '', this.getRoute('/edit'), 'The year requires a name');
    }

    const year = {
      name: req.body.name
    };

    this.models.years.update(req.params.id, year)
      .then(id => {
        req.flash( 'success', 'year updated' );
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => {
        this.displayError(
          req,
          res,
          err,
          this.getRoute([`/${req.params.id}`, '/edit']),
          'Error updating the year - '
        );
      });
  }

  getRemove(req, res) {
    this.models.years.getAll()
      .then(years => {
        const selected = years.find(i => i.id === parseInt(req.params.id, 10));

        if (!selected) {
          throw new Error('Year not found');
        }

        const list = years.map(year => {
          if (year.id == req.params.id) {
            return Object.assign({}, year, {
              disabled: true
            });
          }

          return year;
        });

        res.render('confirm-remove', {
          selected,
          years: list
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  postRemove(req, res) {
    let persist = {};

    this.models.years.getById(req.params.id)
      .then(yearToRemove => {
        if (!yearToRemove) {
          throw new Error('year not found');
        }

        persist.removeId = yearToRemove.id;

        if (req.body.year) {
          return this.models.years.query().getById(parseInt(req.body.year, 10))
            .then(yearToBecome => {
              if (!yearToBecome) {
                throw new Error('New Year not found');
              }

              return this.models.users.updateYear(yearToRemove.id, yearToBecome.id)
            });
        } else {
          return this.models.users.updateYear(yearToRemove.id, null);
        }
      })
      .then(() => {
        return this.models.years.remove(persist.removeId)
      })
      .then(() => {
        req.flash('success', 'Year deleted and items transferred');
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error removing - '));
  }
}

module.exports = YearsController;
