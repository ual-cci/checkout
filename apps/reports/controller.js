const BaseController = require('../../src/js/common/BaseController.js');

const Items = require('../../src/models/items.js');

const config = require('./config.json');

class ItemController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      items: new Items()
    };
  }


  /**
   * Gets the insurance report form
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  getInsurance(req, res) {
    res.render('insurance');
  }

  /**
   * Endpoint for removing an item
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postInsurance(req, res) {
    this.models.items.query()
      .where([['value', '>=', req.body.min_value]])
      .orderBy([
        [ 'name', 'asc' ]
      ])
      .expose()
      .then(items => {
        var data = [
          ['Name,Serial Number,Value,Department,Location,Group']
        ];

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          data.push(`${this._default(item.name)},${this._default(item.serialnumber)},${this._default(item.value)},${this._default(item.department_name)},${this._default(item.location_name)},${this._default(item.group_name)}`)
        }
        data = data.join("\n");

        res.set('Content-Disposition', 'inline;filename=insurance-report.csv');
        res.set('Content-Type', 'text/csv');
        res.send(data);
      });
  }

  _default(value) {
    return value ? value : '';
  }
}

module.exports = ItemController;
