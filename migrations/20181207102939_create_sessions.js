
exports.up = function(knex, Promise) {
  return knex.schema.createTable('session', table => {
    table.string('sid').primary();
    table.json('sess').notNullable();
    table.timestamp('expire', true).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('session');
};
