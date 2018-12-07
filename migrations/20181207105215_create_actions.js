
exports.up = function(knex, Promise) {
  return knex.schema.createTable('actions', table => {
    table.increments();
    table.integer('item_id').notNullable();
    table.integer('user_id').nullable();
    table.timestamp('datetime', true).nullable();
    table.string('action').notNullable();
    table.integer('operator_id').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('actions');
};
