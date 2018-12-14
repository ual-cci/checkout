
exports.up = function(knex, Promise) {
  return knex.schema.table('courses', table => {
    table.dropColumn('contact_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('courses', table => {
    table.integer('contact_id').nullable()
    table.foreign('contact_id').references('users.id');
  });
};
