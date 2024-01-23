exports.up = function(knex) {
	return knex.schema.dropTable('reservations')
}

exports.down = function(knex) {
	return knex.schema.createTable('reservations', table => {
		table.increments()
		table.integer('item_id').notNullable()
		table.timestamp('start_date', true).notNullable()
		table.timestamp('end_date', true).notNullable()
		table.integer('operator_id').notNullable()
		table.foreign('operator_id').references('users.id')
		table.string('action').notNullable()
		table.integer('owner_id').nullable()
	})
}
