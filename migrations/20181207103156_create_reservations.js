
exports.up = function(knex) {
	return knex.schema.createTable('reservations', table => {
		table.increments()
		table.integer('item_id').notNullable()
		table.timestamp('start_date', true).notNullable()
		table.timestamp('end_date', true).notNullable()
		table.integer('user_id').notNullable()
		table.string('action').notNullable()
		table.integer('owner_id').nullable()
	})
}

exports.down = function(knex) {
	return knex.schema.dropTable('reservations')
}
