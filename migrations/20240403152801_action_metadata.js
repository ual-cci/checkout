
exports.up = function(knex) {
	return knex.schema.table('actions', table => {
		table.json('metadata').nullable()
	})
}

exports.down = function(knex) {
	return knex.schema.table('actions', table => {
		table.dropColumn('metadata')
	})
}
