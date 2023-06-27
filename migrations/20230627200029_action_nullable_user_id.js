
exports.up = function(knex) {
	return knex.schema.table('actions', table => {
		table.setNullable('item_id')
	})
}

exports.down = function(knex) {
	return knex.schema.table('actions', table => {
		table.dropNullable('item_id')
	})
}
