
exports.up = function(knex) {
	return knex.schema.table('departments', table => {
		table.string('brand')
	})
}

exports.down = function(knex) {
	return knex.schema.table('departments', table => {
		table.dropColumn('brand')
	})
}
