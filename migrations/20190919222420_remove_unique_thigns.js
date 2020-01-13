
exports.up = function(knex) {
	return knex.schema.table('items', function (table) {
		table.dropUnique('name', 'items_name_unique')
	})
}

exports.down = function(knex) {
	return knex.schema.table('items', function (table) {
		table.unique('name', 'items_name_unique')
	})
}
