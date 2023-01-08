exports.up = function(knex) {
	return knex.schema.table('printers', table => {
		table.text('label')
	})
}

exports.down = function(knex) {
	return knex.schema.table('printers', table => {
		table.dropColumn('label')
	})
}