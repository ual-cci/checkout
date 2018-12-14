const Authentication = require('../src/js/authentication.js');


exports.seed = function(knex, Promise) {
  let res;
  let rej;

  const p = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  Authentication.generatePassword('password', function({salt, hash, iterations}) {
    knex('users').del()
      .then(function () {
        res(knex('users').insert([
          {
            'id': 1,
            'email': 't.lynch@arts.ac.uk',
            'name': 'Tom Lynch',
            'pw_salt': salt,
            'pw_hash': hash,
            'type': 'admin',
            'audit_point': '2018-01-01 00:01:00',
            'disable': false,
            'printer_id': 1,
            'course_id': 23,
            'year_id': 5,
            'barcode': '123408051717',
            'pw_iterations': iterations
          },
          {
            'id': 2,
            'email': 'j.thaw@arts.ac.uk',
            'name': 'Jonny Thaw',
            'pw_salt': salt,
            'pw_hash': hash,
            'type': 'admin',
            'audit_point': '2018-01-01 00:01:00',
            'disable': false,
            'printer_id': 1,
            'course_id': 23,
            'year_id': 5,
            'barcode': '123408229992',
            'pw_iterations': iterations
          }
        ]));
      });
  });

  return p;
};
