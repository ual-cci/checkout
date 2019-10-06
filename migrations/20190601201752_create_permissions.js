
exports.up = function(knex) {
	return Promise.all([
		knex.schema.createTable('roles', table => {
			table.increments()
			table.string('name').notNullable().unique()
		}),
		knex.schema.createTable('permissions', table => {
			table.increments();
			table.integer('role_id')
			table.foreign('role_id').references('roles.id')
			table.string('permission')
		}),
		knex.schema.table('users', table => {
			table.integer('role_id')
			table.foreign('role_id').references('roles.id')
		})
	])
}

exports.down = function(knex) {
	return Promise.all([
		knex.schema.table('users', table => {
			table.dropColumn('role_id')
		}),
		knex.schema.dropTable('permissions'),
		knex.schema.dropTable('roles')
	])
}
