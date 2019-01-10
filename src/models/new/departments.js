const BaseModel = require('./base.js');

class DepartmentModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Departments'
    }));
  }

  getAll() {
    return this.orderBy(['name']).return();
  }
}

module.exports = DepartmentModel;
