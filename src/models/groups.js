const BaseModel = require('./base.js');

class GroupModel extends BaseModel {
  constructor(opts = {}) {
    super({
      ...opts,
      table: 'groups'
    });
  }

  getAll() {
    return this.orderBy([['name']]).retrieve();
  }
}

module.exports = GroupModel;
