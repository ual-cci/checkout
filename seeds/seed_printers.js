
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('printers').del()
    .then(function () {
      // Inserts seed entries
      return knex('printers').insert([
        {
          id: 1,
          name: 'Brother Tape',
          url: 'http://localhost:631/printers/Brother_PT_P900W'
        },
      ]);
    });
};
