
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('groups').del()
    .then(function () {
      // Inserts seed entries
      return knex('groups').insert([
        {
          name: 'Arduino Pack',
          limiter: 1
        },
        {
          name: 'VR Kits',
          limiter: 0
        }
      ]);
    });
};
