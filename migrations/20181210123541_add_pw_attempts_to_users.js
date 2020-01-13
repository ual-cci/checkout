
exports.up = function(knex) {
	return knex.schema.table('users', table => {
		table.integer('pw_attempts').defaultTo(0).notNullable()
	})
}

exports.down = function(knex) {
	return knex.schema.table('users', table => {
		table.dropColumn('pw_attempts')
	})
}
