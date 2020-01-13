
exports.up = function(knex) {
	return knex.schema.table('departments', table => {
		table.dropColumn('barcode')
	})
}

exports.down = function(knex) {
	return knex.schema.table('departments', table => {
		table.string('barcode').unique()
	})
}
