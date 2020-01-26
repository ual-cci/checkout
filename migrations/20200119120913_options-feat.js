
exports.up = function(knex) {
	return knex.schema.createTable('options', table => {
		table.increments()
		table.string('key').unique().notNullable()
		table.string('value').notNullable()
	})
}

exports.down = function(knex) {
	return knex.schema.dropTable('options')
}
