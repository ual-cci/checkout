const BaseModel = require('./base.js');

class ActionModel extends BaseModel {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      name: 'Actions'
    }));
  }

  get joins() {
    return {
      item: {
        table: 'items',
        join: ['id', 'item_id'],
        properties: ['id', 'name', 'barcode']
      },
      user: {
        table: 'users',
        join: ['id', 'user_id'],
        properties: ['id', 'name']
      },
      operator: {
        prefix: 'operators_',
        table: 'users',
        alias: 'operators',
        join: ['operators.id', 'operator_id'],
        properties: ['id', 'name']
      }
    };
  }

  get bootstrap() {
    return ['user', 'operator'];
  }

  get properties() {
    return ['id', 'item_id', 'user_id', 'datetime', 'action', 'operator_id'];
  }

  getByItemId(itemId) {
    return this.query()
      .where([
        ['item_id', itemId]
      ])
      .orderBy([
        ['datetime', 'desc']
      ])
      .return();
  }

  getByItemBarcode(barcode) {
    return this.query()
      .lookup(['item'])
      .where([
        ['barcode', barcode]
      ])
      .orderBy([
        ['datetime', 'desc']
      ])
      .return();
  }

  removeByItemId(itemId) {
    return this.query()
      .where([
        ['item_id', itemId]
      ])
      .get()
      .delete();
  }
}

module.exports = ActionModel;
