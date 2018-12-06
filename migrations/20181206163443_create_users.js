
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('email');
    table.string('name');
    table.string('pw_salt').nullable();
    table.string('pw_hash').nullable();
    table.string('type').defaultTo('user');
    table.timestamp('audit_point', true).nullable();
    table.boolean('disable').nullable().defaultTo(false);
    table.integer('printer_id').nullable();
    table.integer('course_id');
    table.integer('year_id').nullable();
    table.string('barcode');
    table.integer('pw_iterations').defaultTo(50000);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
