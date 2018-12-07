
exports.up = function(knex, Promise) {
  return knex.schema.createTable('printers', table => {
    table.increments();
    table.string('name').notNullable().unique().comment('The display name of the printer.');
    table.string('url').notNullable().comment('The URL to the printer i.e. "http://localhost:631/printer-name".');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('printers');
};
