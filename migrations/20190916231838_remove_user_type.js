
exports.up = function(knex) {
	return knex.schema.table('users', table => {
		table.dropColumn('type')
	})
}

exports.down = function(knex) {
	return knex.schema.table('users', table => {
		table.string('type').defaultTo('user').notNullable()
	})
}
