const BaseController = require('../../src/js/common/BaseController.js');

const NewDepartments = require('../../src/models/departments.js');
const NewItems = require('../../src/models/items.js');

const config = require('./config.json');

class DepartmentController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      departments: new NewDepartments(),
      items: new NewItems(),
    };
  }

  getHome(req, res) {
    this.models.departments.getAll()
      .then(departments => {
        res.render('index', { departments });
      });
  }

  getCreate(req, res) {
    res.render('create', { department: {} });
  }

  postCreate(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, 'The department requires a name', this.getRoute('/create'), 'Error creating - ');
    }

    var brand = req.body.brand;
    brand = brand.replace(/\r\n|\r/g, '\n');

    this.models.departments.create({ name: req.body.name, brand: brand })
      .then(result => {
        req.flash( 'success', 'Department created' );
        req.saveSessionAndRedirect(this.mountPath);
      })
      .catch(err => this.displayError(req, res, err, this.getRoute('/create'), 'Department not created - '));
  }

  getEdit(req, res) {
    this.models.departments.getById(req.params.id)
      .then(department => {
        if (!department) {
          throw new Error('Department not found');
        }

        res.render('edit', { department });
      })
      .catch(err => this.displayError(req, res, err, this,getRoute()));
  }

  postEdit(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, 'The department requires a name', this.getRoute([`/${req.params.id}`, '/edit']), 'Error editing - ');
    }

    var brand = req.body.brand;
    brand = brand.replace(/\r\n|\r/g, '\n');

    this.models.departments.update(req.params.id, { name: req.body.name, brand: brand })
      .then(() => {
        req.flash( 'success', 'Department updated' );
        req.saveSessionAndRedirect(this.mountPath);
      })
      .catch(err => this.displayError(req, res, err, this.getRoute([`/${req.params.id}`, '/edit']), 'Department not updated - '));
  }

  getRemove(req, res) {
    this.models.departments.getAll()
      .then(departments => {
        const selected = departments.find(d => d.id === parseInt(req.params.id, 10));

        if (!selected) {
          throw new Error('Departments not found');
        }

        const list = departments.map(department => {
          if (department.id == req.params.id) {
            return Object.assign({}, department, {
              disabled: true
            });
          }

          return department;
        });

        res.render('confirm-remove', {
          selected: selected,
          departments: list
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  postRemove(req, res) {
    let removeId;

    Promise.all([
      this.models.departments.query().getById(req.params.id),
      this.models.departments.query().getById(req.body.department)
    ])
      .then(([ departmentToRemove, departmentToBecome ]) => {
        if (!departmentToBecome || !departmentToRemove) {
          throw new Error('Department to remove/become not found');
        }

        removeId = departmentToRemove.id;
        return { departmentToRemove, departmentToBecome };
      })
      .then(({ departmentToRemove, departmentToBecome }) => {
        return this.models.items.updateDepartment(departmentToRemove.id, departmentToBecome.id);
      })
      .then(() => {
        return this.models.departments.remove(removeId);
      })
      .then(() => {
        req.flash( 'success', 'Department deleted and items transferred' );
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => {
        this.displayError(req, res, err, this.getRoute(), 'Error removing post - ');
      });
  }
}

module.exports = DepartmentController;
