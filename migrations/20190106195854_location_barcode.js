
exports.up = function(knex) {
  return knex.schema.table('locations', table => {
    table.string('barcode').unique();
  });
};

exports.down = function(knex) {
  return knex.schema.table('locations', table => {
    table.dropColumn('barcode');
  });
};
