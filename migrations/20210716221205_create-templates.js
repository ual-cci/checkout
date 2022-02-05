exports.up = function(knex) {
	return knex.schema.createTable('templates', table => {
		table.increments()
		table.string('name').notNullable().unique()
		table.string('subject').notNullable().unique()
		table.text('body').notNullable()
	})
}

exports.down = function(knex) {
	return knex.schema.dropTable('templates')
}
