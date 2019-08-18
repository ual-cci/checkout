
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('actions', table => {
      table.foreign('item_id').references('items.id');
      table.foreign('user_id').references('users.id');
      table.foreign('operator_id').references('users.id');
    }),
    knex.schema.table('courses', table => {
      table.foreign('contact_id').references('users.id');
    }),
    knex.schema.table('items', table => {
      table.foreign('group_id').references('groups.id');
      table.foreign('department_id').references('departments.id');
      table.foreign('owner_id').references('users.id');
    }),
    knex.schema.table('reservations', table => {
      table.foreign('item_id').references('items.id');
      table.foreign('user_id').references('users.id');
      table.foreign('owner_id').references('users.id');
    }),
    knex.schema.table('users', table => {
      table.foreign('printer_id').references('printers.id');
      table.foreign('course_id').references('courses.id');
      table.foreign('year_id').references('years.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('actions', table => {
      table.dropForeign('item_id');
      table.dropForeign('user_id');
      table.dropForeign('operator_id');
    }),
    knex.schema.table('courses', table => {
      table.dropForeign('contact_id');
    }),
    knex.schema.table('items', table => {
      table.dropForeign('group_id');
      table.dropForeign('department_id');
      table.dropForeign('owner_id');
    }),
    knex.schema.table('reservations', table => {
      table.dropForeign('item_id');
      table.dropForeign('user_id');
      table.dropForeign('owner_id');
    }),
    knex.schema.table('users', table => {
      table.dropForeign('printer_id');
      table.dropForeign('course_id');
      table.dropForeign('year_id');
    })
  ]);
};
