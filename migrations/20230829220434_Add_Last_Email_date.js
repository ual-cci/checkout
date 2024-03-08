exports.up = function(knex) {
	return knex.schema.table('users', table => {
		table.datetime('last_emailed', true).nullable()
	})
}

exports.down = function(knex) {
	return knex.schema.table('users', table => {
		table.dropColumn('last_emailed')
	})
}
