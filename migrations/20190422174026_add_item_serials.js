
exports.up = function(knex) {
	return knex.schema.table('items', table => {
		table.string('serialnumber')
	})
}

exports.down = function(knex) {
	return knex.schema.table('items', table => {
		table.dropColumn('serialnumber')
	})
}
