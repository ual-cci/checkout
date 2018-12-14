
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('years').del()
    .then(function () {
      return knex('years').insert([
        { name: 'Graduated' },
        { name: '3rd Year' },
        { name: '2nd Year' },
        { name: '1st Year' },
        { name: 'N/A' },
      ]);
    });
};
