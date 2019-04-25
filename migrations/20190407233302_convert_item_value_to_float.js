
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('items', table => {
    table.decimal('value').alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('items', table => {
    table.string('value').alter();
  });
};
