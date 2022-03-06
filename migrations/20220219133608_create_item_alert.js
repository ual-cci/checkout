exports.up = function(knex) {
	return knex.schema.table('items', table => {
		table.text('alert_msg')
	})
}

exports.down = function(knex) {
	return knex.schema.table('items', table => {
		table.dropColumn('alert_msg')
	})
}