
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('locations').del()
    .then(function () {
      // Inserts seed entries
      return knex('locations').insert([
        { name: 'WG28a > Main shelves', barcode: 'WG28a.1' },
        { name: 'WG28a > Red trolley', barcode: 'WG28a.2' },
        { name: 'WG28a > Small cupboard', barcode: 'WG28a.3' },
        { name: 'WG28 > Teaching cupboard', barcode: 'WG28.1' },
        { name: 'WG28 > VR cupboard', barcode: 'WG28.2' },
        { name: 'WG28 > Electronics cupboard', barcode: 'WG28.3' }
      ]);
    });
};
