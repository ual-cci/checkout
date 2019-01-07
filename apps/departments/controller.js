const NewDepartments = require('../../src/models/new/departments.js');
const NewItems = require('../../src/models/new/items.js');

class DepartmentController {
  constructor(mountPath) {
    this.mountPath = mountPath;
    this.models = {
      departments: new NewDepartments(),
      items: new NewItems(),
    };
  }

  getHome(req, res) {
    this.models.departments.getAll()
      .then(departments => {
        console.log(departments);
        res.render('departments', { departments: departments });
      });
  }

  getCreate(req, res) {
    res.render('create', { department: {} });
  }

  postCreate(req, res) {
    if (req.body.name == '') {
      req.flash( 'danger', 'The department requires a name' );
      res.redirect(`${this.mountPath}/create`);
    }

    this.models.departments.create({ name: req.body.name })
      .catch(err => {
        req.flash( 'danger', `Department not created - ${err}`);
        res.redirect(this.mountPath);
      })
      .then(result => {
        req.flash( 'success', 'Department created' );
        res.redirect(this.mountPath);
      });
  }

  getEdit(req, res) {
    this.models.departments.getById(req.params.id)
      .then(department => {
        if (!department) {
          req.flash( 'danger', 'Department not found' );
          res.redirect(this.mountPath);
        } else {
          res.render( 'edit', { department: department } );
        }
      });
  }

  postEdit(req, res) {
    if (req.body.name == '') {
      req.flash( 'danger', 'The department requires a name' );
      res.redirect(`${this.mountPath}/edit`);
    }

    this.models.departments.update(req.params.id, { name: req.body.name })
      .then(() => {
        req.flash( 'success', 'Department updated' );
        res.redirect(this.mountPath);
      })
      .catch(err => {
        req.flash( 'danger', `Department not updated - ${err}`);
        res.redirect(this.mountPath);
      });
  }

  getRemove(req, res) {
    this.models.departments.getAll()
      .then(departments => {
        const selected = departments.find(d => d.id === parseInt(req.params.id, 10));
        const list = departments.map(department => {
          if (department.id == req.params.id) {
            return Object.assign({}, department, {
              disabled: true
            });
          }

          return department;
        });

        if (selected) {
          res.render( 'confirm-remove', {
            selected: selected,
            departments: list
          } );
        } else {
          req.flash( 'danger', 'Departments not found' );
          res.redirect(this.mountPath);
        }
      })
  }

  postRemove(req, res) {
    Promise.all([
      this.models.departments.query().getById(req.params.id),
      this.models.departments.query().getById(req.body.department)
    ])
      .then(([ departmentToRemove, departmentToBecome ]) => {
        if (!departmentToBecome || !departmentToRemove) {
          req.flash( 'danger', 'Department to remove/become not found' );
          res.redirect(this.mountPath);
        }

        return { departmentToRemove, departmentToBecome };
      })
      .then(({ departmentToRemove, departmentToBecome }) => {
        this.models.items.updateDepartment(departmentToRemove.id, departmentToBecome.id)
          .then(id => {
            this.models.departments.remove(departmentToRemove.id)
              .then(() => {
                req.flash( 'success', 'Department deleted and items transferred' );
                res.redirect(this.mountPath);
              })
              .catch(err => {
                req.flash( 'danger', `Could not remove department – ${err}` );
                res.redirect(this.mountPath);
              });
          })
          .catch(err => {
            req.flash( 'danger', `Could not transfer items to new department – ${err}` );
            res.redirect(this.mountPath);
          });
      });
  }
}

module.exports = DepartmentController;
