const db = require('../../js/database.js');

class BaseModel {
  constructor({ name, table, debug = false }) {
    this.options = {
      name,
      table: table || name.toLowerCase(),
      debug
    };
  }

  get joins() {
    return {};
  }

  get properties() {
    return [];
  }

  _safeguard() {
    if (!this._queryObj) {
      this.query();
    }
  }

  _propertiesToSelect(properties, table = false, prefix = '') {
    const obj = {};

    properties.forEach(prop => {
      obj[`${prefix}${prop}`] = `${table ? table : this.options.table}.${prop}`
    });

    return obj;
  }

  /**
   * Creates a new knex query and attaches the
   * models default selects to it
   */
  query() {
    this._queryObj = db(this.options.table);

    if (this.properties.length) {
      this._queryObj.select(this._propertiesToSelect(this.properties));
    }

    return this;
  }

  raw(func) {
    this._safeguard();
    func(this._queryObj);
    return this;
  }

  if(condition, func) {
    this._safeguard();

    if (condition) {
      return this.raw(func);
    }

    return this;
  }

  /**
   * Adds a where argument to the query
   *
   * @param {Array} args Multidimensional array of either 2 or 3 values
   * @param {String} type One of 'where', 'andWhere' and 'orWhere
   */
  where(args, type = 'where') {
    this._safeguard();

    args.forEach(a => {
      switch (a.length) {
        case 2:
          this._queryObj[type](a[0], a[1]);
          break;
        case 3:
          this._queryObj[type](a[0], a[1], a[2]);
          break;
      }
    });

    return this;
  }

  /**
   * Adds an order by to the query
   *
   * @param {Array} args Multidimensional array of either 1 or 2 values
   */
  orderBy(args) {
    this._safeguard();

    args.forEach(a => {
      switch (a.length) {
        case 1:
          this._queryObj.orderBy(a[0])
          break;
        case 2:
          this._queryObj.orderBy(a[0], a[1]);
          break;
      }
    });

    return this;
  }

  /**
   * Optional lookup and joins
   *
   * @param {Array} keys Single dimensional array of keys that
   * are associated to the models joins get method
   */
  lookup(keys) {
    this._safeguard();
    const joins = this.joins;

    keys.forEach(k => {
      if (k in joins) {
        const { table, join, properties, prefix } = joins[k];

        // If the key is absolute (with .) use it, if not create it
        const foreignJoinKey = join[0].indexOf('.') >= 0 ? join[0] : `${table}.${join[0]}`;
        const tableJoinKey = join[1].indexOf('.') >= 0 ? join[1] : `${this.options.table}.${join[1]}`;

        this._queryObj.leftJoin(table, foreignJoinKey, tableJoinKey)
          .select(
            this._propertiesToSelect(
              properties,
              table,
              prefix ? prefix :`${k}_`
            )
          );
      }
    });

    return this;
  }

  /**
   * Return the raw query object
   */
  get() {
    this._safeguard();

    if (this.options.debug) {
      console.log(this._queryObj.toString());
    }

    return this._queryObj;
  }

  return(func) {
    return new Promise((resolve, reject) => {
      this.get()
        .then(results => {
          resolve(results);
        })
        .catch(err => {
          reject(err);
        })
    });
  }
}

module.exports = BaseModel;
