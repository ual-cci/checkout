
exports.up = function(knex, Promise) {
  return knex.schema.table('items', table => {
    table.integer('department_id');
    table.foreign('department_id').references('departments.id');
    table.foreign('location_id').references('locations.id');
  })
};

exports.down = function(knex, Promise) {
  knex.schema.table('items', table => {
    table.foreign('location_id').references('departments.id');
    table.dropColumn('department_id');
  })
};
