exports.up = function(knex) {
	return Promise.all([
		knex.schema.table('items', table => {
			table.dropColumn('department_id')
		}),
		knex.schema.dropTable('departments')
	])
}

exports.down = function(knex) {
	return Promise.all([
		knex.schema.createTable('departments', table => {
			table.increments()
			table.string('name').notNullable().unique()
			table.string('brand')
		}),
		knex.schema.table('items', table => {
			table.integer('department_id')
			table.foreign('department_id').references('departments.id')
		})
	])
}
