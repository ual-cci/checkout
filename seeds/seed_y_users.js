const Authentication = require('../src/js/authentication.js');

const seedFunction = function(knex, Promise) {
  let res;
  let rej;

  const p = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  Promise.all([
    knex('printers').first('id'),
    knex('roles').where({
      name: 'Super Admin'
    }).first('id'),
    knex('courses').where({
      name: 'Technicians'
    }).first('id'),
    knex('years').where({
      name: 'N/A'
    }).first('id'),
  ])
    .then(([printer, role, course, year]) => {
      const roleId = role.id;
      const printerId = printer.id;
      const courseId = course.id;
      const yearId = year.id;

      Authentication.generatePassword('password', function({salt, hash, iterations}) {
        knex('users').del()
          .then(function () {
            res(knex('users').insert([
              {
                'email': 'j.appleseed@example.com',
                'name': 'Jonny Appleseed',
                'pw_salt': salt,
                'pw_hash': hash,
                'audit_point': '2000-01-01 00:00:00',
                'disable': false,
                'printer_id': printerId,
                'course_id': courseId,
                'year_id': yearId,
                'barcode': 'JAPPLESEED123',
                'pw_iterations': iterations,
                'role_id': roleId
              },
              {
                'email': 'a.smith@example.com',
                'name': 'Amanda Smith',
                'pw_salt': salt,
                'pw_hash': hash,
                'audit_point': '2000-01-01 00:00:00',
                'disable': false,
                'printer_id': printerId,
                'course_id': courseId,
                'year_id': yearId,
                'barcode': 'ASMITH456',
                'pw_iterations': iterations,
                'role_id': roleId
              }
            ]));
          });
      });
    });

  return p;
};

exports.seed = seedFunction;
