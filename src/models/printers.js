const BaseModel = require('./base.js');

class PrinterModel extends BaseModel {
  constructor(opts = {}) {
    super({
      ...opts,
      table: 'printers'
    });
  }

  getAll() {
    return this.orderBy([['name']]).retrieve();
  }
}

module.exports = PrinterModel;
