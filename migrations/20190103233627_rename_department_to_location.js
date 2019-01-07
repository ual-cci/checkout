
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.renameTable('departments', 'locations' ),
    knex.schema.table('items', table => {
      table.renameColumn('department_id', 'location_id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.renameTable('locations', 'departments' ),
    knex.schema.table('items', table => {
      table.renameColumn('location_id', 'department_id');
    })
  ]);
};
