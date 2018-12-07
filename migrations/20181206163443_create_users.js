
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('email').notNullable().unique();
    table.string('name').notNullable();
    table.string('pw_salt').nullable();
    table.string('pw_hash').nullable();
    table.string('type').defaultTo('user').notNullable();
    table.timestamp('audit_point', true).nullable();
    table.boolean('disable').nullable().defaultTo(false);
    table.integer('printer_id').nullable();
    table.integer('course_id').notNullable();
    table.integer('year_id').nullable();
    table.string('barcode').notNullable().unique();
    table.integer('pw_iterations').defaultTo(50000).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
