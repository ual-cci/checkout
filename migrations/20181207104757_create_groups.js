
exports.up = function(knex, Promise) {
  return knex.schema.createTable('groups', table => {
    table.increments();
    table.string('name').notNullable().unique();
    table.integer('limiter').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('groups');
};
