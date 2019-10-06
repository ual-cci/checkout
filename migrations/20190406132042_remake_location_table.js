
exports.up = function(knex) {
	return Promise.all([
		knex.schema.createTable('locations', table => {
			table.increments()
			table.string('name').notNullable().unique()
			table.string('barcode').unique()
		})
	])
};

exports.down = function(knex) {
	return Promise.all([
		knex.schema.dropTable('locations')
	])
}
