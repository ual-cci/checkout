const BaseModel = require('./base.js');

class UserModel extends BaseModel {
  constructor(opts = {}) {
    super({
      ...opts,
      table: 'users'
    });
  }

  get joins() {
    return {
      course: {
        table: 'courses',
        join: ['id', 'course_id'],
        properties: ['id', 'name']
      },
      year: {
        table: 'years',
        join: ['id', 'year_id'],
        properties: ['id', 'name']
      },
      contact: {
        prefix: 'course_contact_',
        table: 'users',
        alias: 'contact',
        join: ['courses.contact_id', 'contact.id'],
        properties: ['id', 'name', 'email']
      },
      printer: {
        table: 'printers',
        join: ['id', 'printer_id'],
        properties: ['id', 'name', 'url']
      },
    };
  }

  get properties() {
    return ['id', 'name', 'email', 'barcode', 'disable', 'type', 'pw_hash', 'pw_salt', 'pw_attempts', 'pw_iterations', 'audit_point', 'printer_id'];
  }

  getAll() {
    return this.retrieve();
  }

  getByBarcode(barcode) {
    return this.query().where([['barcode', barcode]]).retrieveSingle();
  }

  updateCourse(oldCourseId, newCourseId) {
    return new Promise((resolve, reject) => {
      this.query()
        .expose()
        .where('course_id', oldCourseId)
        .update({
          'course_id': newCourseId
        })
        .then(() => {
          resolve(newCourseId);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  updateCourse(oldCourseId, newCourseId) {
    return new Promise((resolve, reject) => {
      this.query()
        .expose()
        .where('course_id', oldCourseId)
        .update({
          'course_id': newCourseId
        })
        .then(() => {
          resolve(newCourseId);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  updatePrinter(oldPrinterId, newPrinterId) {
    return new Promise((resolve, reject) => {
      this.query()
        .expose()
        .where('printer_id', oldPrinterId)
        .update({
          'printer_id': newPrinterId
        })
        .then(() => {
          resolve(newPrinterId);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  updateYear(oldYearId, newYearId) {
    return new Promise((resolve, reject) => {
      this.query()
        .expose()
        .where('year_id', oldYearId)
        .update({
          'year_id': newYearId
        })
        .then(() => {
          resolve(newYearId);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  search(term) {
    return super.search(term, ['name', 'barcode'], ['name', 'asc']);
  }
}

module.exports = UserModel;
