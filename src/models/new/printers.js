const BaseModel = require('./base.js');

class PrinterModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Printers'
    }));
  }

  getAll() {
    return this.orderBy(['name']).return();
  }
}

module.exports = PrinterModel;
