
exports.up = function(knex) {
  return knex.schema.createTable('groups', table => {
    table.increments();
    table.string('name').notNullable().unique();
    table.integer('limiter').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('groups');
};
