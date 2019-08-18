
exports.up = function(knex) {
  return knex.schema.createTable('courses', table => {
    table.increments();
    table.string('name').notNullable().unique();
    table.integer('contact_id').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('courses');
};
