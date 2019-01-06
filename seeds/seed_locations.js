
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('locations').del()
    .then(function () {
      // Inserts seed entries
      return knex('locations').insert([
        { name: 'WG28a > Main shelves' },
        { name: 'WG28a > Red trolley' },
        { name: 'WG28a > Small cupboard' },
        { name: 'WG28 > Teaching cupboard' },
        { name: 'WG28 > VR cupboard' },
        { name: 'WG28 > Electronics cupboard' }
      ]);
    });
};
