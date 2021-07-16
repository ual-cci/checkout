exports.up = function(knex) {
    return knex.schema.table('users', table => {
        table.integer('template_id').nullable()
        table.foreign('template_id').references('templates.id')
    })
};

exports.down = function(knex) {
    return knex.schema.table('users', table => {
        table.dropColumn('template_id')
    })
};
