const BaseModel = require('./base.js');

class GroupModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Groups'
    }));
  }
}

module.exports = GroupModel;
