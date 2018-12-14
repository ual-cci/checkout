const Authentication = require('../src/js/authentication.js');
const logger = require('../src/js/logger.js');


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
                'email': 't.lynch@arts.ac.uk',
                'name': 'Tom Lynch',
                'pw_salt': salt,
                'pw_hash': hash,
                'type': 'admin',
                'audit_point': '2018-01-01 00:01:00',
                'disable': false,
                'printer_id': printerId,
                'course_id': courseId,
                'year_id': yearId,
                'barcode': '123408051717',
                'pw_iterations': iterations
              },
              {
                'email': 'j.thaw@arts.ac.uk',
                'name': 'Jonny Thaw',
                'pw_salt': salt,
                'pw_hash': hash,
                'type': 'admin',
                'audit_point': '2018-01-01 00:01:00',
                'disable': false,
                'printer_id': printerId,
                'course_id': courseId,
                'year_id': yearId,
                'barcode': '123408229992',
                'pw_iterations': iterations
              }
            ]));
          });
      });
    });

  return p;
};

exports.seed = seedFunction;
