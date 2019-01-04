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
    knex('courses').where({
      name: 'Technicians'
    }).first('id'),
    knex('years').where({
      name: 'N/A'
    }).first('id'),
  ])
    .then(results => {
      const printerId = results[0].id;
      const courseId = results[1].id;
      const yearId = results[2].id;

      Authentication.generatePassword('password', function({salt, hash, iterations}) {
        knex('users').del()
          .then(function () {
            res(knex('users').insert([
              {
                'email': 'j.appleseed@example.com',
                'name': 'Jonny Appleseed',
                'pw_salt': salt,
                'pw_hash': hash,
                'type': 'admin',
                'audit_point': '2000-01-01 00:00:00',
                'disable': false,
                'printer_id': printerId,
                'course_id': courseId,
                'year_id': yearId,
                'barcode': 'JAPPLESEED123',
                'pw_iterations': iterations
              },
              {
                'email': 'a.smith@example.com',
                'name': 'Amanda Smith',
                'pw_salt': salt,
                'pw_hash': hash,
                'type': 'admin',
                'audit_point': '2000-01-01 00:00:00',
                'disable': false,
                'printer_id': printerId,
                'course_id': courseId,
                'year_id': yearId,
                'barcode': 'ASMITH456',
                'pw_iterations': iterations
              }
            ]));
          });
      });
    });

  return p;
};

exports.seed = seedFunction;
