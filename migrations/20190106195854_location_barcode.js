
exports.up = function(knex, Promise) {
  return knex.schema.table('locations', table => {
    table.string('barcode').unique();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('locations', table => {
    table.dropColumn('barcode');
  });
};
