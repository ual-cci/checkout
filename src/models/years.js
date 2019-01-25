const BaseModel = require('./base.js');

class YearModel extends BaseModel {
  constructor(opts = {}) {
    super({
      ...opts,
      table: 'years'
    });
  }

  getAll() {
    return this.orderBy([['name']]).retrieve();
  }
}

module.exports = YearModel;
