
exports.up = function(knex, Promise) {
  return knex.schema.table('items', table => {
    table.string('serialnumber');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('items', table => {
    table.dropColumn('serialnumber');
  });
};
