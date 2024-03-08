exports.up = function(knex) {
	return knex.schema.table('templates', table => {
		table.text('type')
	})
}

exports.down = function(knex) {
	return knex.schema.table('templates', table => {
		table.dropColumn('type')
	})
}
