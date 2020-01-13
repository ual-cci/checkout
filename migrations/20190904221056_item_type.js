
exports.up = function(knex) {
	return knex.schema.table('items', table => {
		table.boolean('loanable').defaultTo(true)
	})
}

exports.down = function(knex) {
	return knex.schema.table('items', table => {
		table.dropColumn('loanable')
	})
}
