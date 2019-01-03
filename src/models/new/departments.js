const BaseModel = require('./base.js');

class DepartmentModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Departments'
    }));
  }
}

module.exports = DepartmentModel;
