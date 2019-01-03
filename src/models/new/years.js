const BaseModel = require('./base.js');

class YearModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Years'
    }));
  }

  getAll() {
    return this.orderBy(['name']).return()
  }
}

module.exports = YearModel;
