
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return Promise.all([
    knex('users').del(),
  ])
    .then(Promise.all([
      knex('courses').del(),
      knex('years').del(),
      knex('locations').del(),
      knex('groups').del(),
      knex('printers').del(),
    ]));
};
