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

  get bootstrap() {
    return [];
  }

  /**
   * Method to erase or reset references to
   * a previous query
   */
  _reset() {
    this.query();
  }

  /**
   * Creates a new row using the given values
   *
   * @param {Object} values
   */
  create(values) {
    return new Promise((resolve, reject) => {
      const query = db(this.options.table).insert(values, 'id')

      if (this.options.debug) {
        console.log(query.toString());
      }

      query.then(ids => {
          resolve(ids);
        })
        .catch(err => {
          reject(err);
        })
        .finally(() => {
          this._reset();
        });
    });
  }

  /**
   * Updates a row's values using its ID
   *
   * @param {Number} id
   * @param {Object} values
   */
  update(id, values) {
    return new Promise((resolve, reject) => {
      const query = this.query().where([['id', id]]).get().update(values);

      if (this.options.debug) {
        console.log(query.toString());
      }

      query.then(ids => {
          resolve(ids);
        })
        .catch(err => {
          reject(err);
        })
        .finally(() => {
          this._reset();
        });
    });
  }

  /**
   * Update multiple rows with the same values at once
   *
   * @param {Array} ids
   * @param {Object} values
   */
  updateMultiple(ids, values) {
    return new Promise((resolve, reject) => {
      const query = this.query().getMultipleByIds(ids).update(values);

      if (this.options.debug) {
        console.log(query.toString());
      }

      query.then(ids => {
          resolve(ids);
        })
        .catch(err => {
          reject(err);
        })
        .finally(() => {
          this._reset();
        });
    });
  }

  /**
   * Removes a row from the DB using its ID
   *
   * @param {Number} id
   */
  remove(id) {
    return new Promise((resolve, reject) => {
      const query = this.query().get()
        .where( 'id', id )
        .delete();

      if (this.options.debug) {
        console.log(query.toString());
      }

      query.then(() => {
          resolve(id);
        })
        .catch(err => {
          reject(err);
        })
        .finally(() => {
          this._reset();
        });
    });
  }

  /**
   * Makes sure a query has been created
   * and creates one if not
   *
   * @private
   */
  _safeguard() {
    if (!this._queryObj) {
      this.query();
    }
  }

  /**
   * A helper function to turn a list into knex like
   * select object
   *
   * @param {Array} properties The list of properties
   * @param {String?} table An override for table to select from
   * @param {String?} prefix A prefix if the selects need to be aliased
   * @private
   */
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

    this.lookup(this.bootstrap);

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
      const column = a[0].indexOf('.') >= 0 ? a[0] : `${this.options.table}.${a[0]}`;
      switch (a.length) {
        case 2:
          this._queryObj[type](column, a[1]);
          break;
        case 3:
          this._queryObj[type](column, a[1], a[2]);
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
        const { table, join, properties, prefix, alias } = joins[k];

        // If the key is absolute (with .) use it, if not create it
        const foreignJoinKey = join[0].indexOf('.') >= 0 ? join[0] : `${table}.${join[0]}`;
        const tableJoinKey = join[1].indexOf('.') >= 0 ? join[1] : `${this.options.table}.${join[1]}`;

        const tableTarget = alias ? `${table} AS ${alias}` : table;

        this._queryObj.leftJoin(tableTarget, foreignJoinKey, tableJoinKey)
          .select(
            this._propertiesToSelect(
              properties,
              alias ? alias : table,
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

  /**
   * Wrapper to return results while
   * adding a universal catch
   */
  return() {
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

  /**
   * Wrapper method to resolve as the single
   * and first item from a query
   */
  returnSingle() {
    return new Promise((resolve, reject) => {
      this.get()
        .then(results => {
          resolve(results.length ? results[0] : false);
        })
        .catch(err => {
          reject(err);
        })
    });
  }

  /**
   * Return item from id
   *
   * @param {Number} id
   */
  getById(id) {
    return this.where([['id', id]]).returnSingle();
  }

  /**
   * Wrapper function to return multiple items
   * using their ids
   *
   * @param {Array} ids
   */
  getMultipleByIds(ids) {
    return this.query().get().whereIn(`${this.options.table}.id`, ids);
  }
}

module.exports = BaseModel;
