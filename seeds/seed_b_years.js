
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('years').del()
    .then(function () {
      return knex('years').insert([
        {id: 1, name: 'Graduated'},
        {id: 2, name: '3rd Year'},
        {id: 3, name: '2nd Year'},
        {id: 4, name: '1st Year'},
        {id: 5, name: 'N/A'},
      ]);
    });
};
