
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      return knex('users').insert([
        {
          'id': 1,
          'email': 't.lynch@arts.ac.uk',
          'name': 'Tom Lynch',
          'pw_salt': 'REDACTED',
          'pw_hash': 'REDACTED',
          'type': 'admin',
          'audit_point': '2018-01-01 00:01:00',
          'disable': false,
          'printer_id': 1,
          'course_id': 23,
          'year_id': 5,
          'barcode': '123408051717',
          'pw_iterations': 50000
        },
        {
          'id': 2,
          'email': 'j.thaw@arts.ac.uk',
          'name': 'Jonny Thaw',
          'pw_salt': 'REDACTED',
          'pw_hash': 'REDACTED',
          'type': 'admin',
          'audit_point': '2018-01-01 00:01:00',
          'disable': false,
          'printer_id': 1,
          'course_id': 23,
          'year_id': 5,
          'barcode': '123408229992',
          'pw_iterations': 50000
        }
      ]);
    });
};















