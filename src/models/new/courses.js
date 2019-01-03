const BaseModel = require('./base.js');

class CourseModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Courses'
    }));
  }

  get joins() {
    return {
      user: {
        table: 'users',
        join: ['id', 'contact_id'],
        properties: ['id', 'name', 'email']
      }
    };
  }

  get properties() {
    return ['id', 'name', 'contact_id'];
  }

  getAll() {
    return this.lookup(['user']).orderBy(['name']).return();
  }
}

module.exports = CourseModel;
