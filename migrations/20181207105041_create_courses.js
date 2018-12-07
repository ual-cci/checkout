
exports.up = function(knex, Promise) {
  return knex.schema.createTable('courses', table => {
    table.increments();
    table.string('name').notNullable().unique();
    table.integer('contact_id').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('courses');
};
