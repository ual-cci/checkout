
exports.up = function(knex, Promise) {
  return knex.schema.table('locations', table => {
    table.string('barcode').notNullable().unique();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('locations', table => {
    table.dropColumn('barcode');
  });
};
