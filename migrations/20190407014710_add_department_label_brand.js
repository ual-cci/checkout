
exports.up = function(knex, Promise) {
  return knex.schema.table('departments', table => {
    table.string('brand');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('departments', table => {
    table.dropColumn('brand');
  });
};
