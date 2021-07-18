exports.up = function(knex) {
	return knex.schema.table('items', table => {
		table.text('info_url')
	})
}

exports.down = function(knex) {
	return knex.schema.table('items', table => {
		table.dropColumn('info_url')
	})
}
