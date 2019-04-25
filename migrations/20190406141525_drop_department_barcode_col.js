
exports.up = function(knex, Promise) {
  return knex.schema.table('departments', table => {
    table.dropColumn('barcode');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('departments', table => {
    table.string('barcode').unique();
  });
};
