
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('reservations', table => {
      table.renameColumn('user_id','operator_id');
      table.foreign('operator_id').references('users.id');
      table.dropForeign('user_id');
    }),
    knex.schema.table('items', table => {
      table.datetime('issued', true).nullable();
      table.datetime('due', true).nullable();
    }),
    knex.schema.table('groups', table => {
      table.specificType('duration','interval').nullable();
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('groups', table => {
      table.dropColumn('duration');
    }),
    knex.schema.table('items', table => {
      table.dropColumn('issued');
      table.dropColumn('due');
    }),
    knex.schema.table('reservations', table => {
      table.renameColumn('operator_id','user_id');
      table.dropForeign('operator_id');
      table.foreign('user_id').references('users.id');
    })
  ]);
};
