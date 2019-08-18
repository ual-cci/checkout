
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('departments').del()
    .then(function () {
      // Inserts seed entries
      return knex('departments').insert([
        { name: 'Default Department' }
      ]);
    });
};
