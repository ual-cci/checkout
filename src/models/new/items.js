const BaseModel = require('./base.js');

class ItemModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Items'
    }));
  }

  get joins() {
    return {
      group: {
        table: 'groups',
        join: ['id', 'group_id'],
        properties: ['id', 'name', 'limiter']
      },
      department: {
        table: 'departments',
        join: ['id', 'department_id'],
        properties: ['id', 'name']
      },
      user: {
        prefix: 'owner_',
        table: 'users',
        join: ['id', 'owner_id'],
        properties: ['id', 'name']
      },
      course: {
        prefix: 'owner_course_',
        table: 'courses',
        join: ['id', 'users.course_id'],
        properties: ['id', 'name']
      },
      year: {
        prefix: 'owner_year_',
        table: 'years',
        join: ['id', 'users.year_id'],
        properties: ['id', 'name']
      }
    };
  }

  get bootstrap() {
    return ['group', 'department', 'user', 'course', 'year'];
  }

  get properties() {
    return ['id', 'name', 'barcode', 'notes', 'value', 'label', 'status', 'audited', 'updated'];
  }

  updateDepartment(oldDepartmentId, newDepartmentId) {
    return new Promise((resolve, reject) => {
      this.query()
        .get()
        .where('department_id', oldDepartmentId)
        .update({
          'department_id': newDepartmentId
        })
        .then(() => {
          resolve(newDepartmentId);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  updateGroup(oldGroupId, newGroupId = null) {
    return new Promise((resolve, reject) => {
      this.query()
        .get()
        .where('group_id', oldGroupId)
        .update({
          'group_id': newGroupId
        })
        .then(() => {
          resolve(newGroupId);
        })
        .catch(err => {
          reject(err);
        });
    })
  }
}

module.exports = ItemModel;
