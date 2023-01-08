exports.up = function(knex) {
	return knex.schema.table('templates', table => {
		table.text('label')
	})
}

exports.down = function(knex) {
	return knex.schema.table('templates', table => {
		table.dropColumn('label')
	})
}