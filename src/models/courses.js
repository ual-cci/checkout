const BaseModel = require('./base.js');

class CourseModel extends BaseModel {
  constructor(opts = {}) {
    super({
      ...opts,
      table: 'courses'
    });
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
    return this.lookup(['user']).orderBy([['name']]).retrieve();
  }
}

module.exports = CourseModel;
