exports.up = function(knex) {
	return knex.schema.table('users', table => {
		table.json('columns').default('{"items":["status", "barcode", "group", "location", "value"]}')
	})
}

exports.down = function(knex) {
	return knex.schema.table('users', table => {
		table.dropColumn('columns')
	})
}