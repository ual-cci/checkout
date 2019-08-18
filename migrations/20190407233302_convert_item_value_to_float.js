
exports.up = function(knex) {
  return knex.schema.alterTable('items', table => {
    table.decimal('value').alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('items', table => {
    table.string('value').alter();
  });
};
