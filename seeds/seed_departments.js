
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('departments').del()
    .then(function () {
      // Inserts seed entries
      return knex('departments').insert([
        { name: 'Creative Technology Lab' },
        { name: 'The Digital Space' },
        { name: 'AV/Live Events' }
      ]);
    });
};
