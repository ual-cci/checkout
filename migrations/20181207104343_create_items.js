
exports.up = function(knex, Promise) {
  return knex.schema.createTable('items', table => {
    table.increments();
    table.string('name').notNullable().unique();
    table.string('barcode').notNullable().unique();
    table.integer('group_id').nullable();
    table.integer('department_id').notNullable();
    table.text('notes').nullable();
    table.string('value').nullable();
    table.string('label').nullable();
    table.string('status').nullable();
    table.timestamp('updated', true).nullable();
    table.timestamp('audited', true).nullable();
    table.integer('owner_id').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('items');
};
