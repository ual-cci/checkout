
exports.up = function(knex) {
	return knex.schema.createTable('session', table => {
		table.string('sid').primary()
		table.json('sess').notNullable()
		table.timestamp('expire', true).notNullable()
	})
}

exports.down = function(knex) {
	return knex.schema.dropTable('session')
}
