
exports.up = function(knex) {
	return Promise.all([
		knex.schema.table('items', table => {
			table.dropForeign('department_id') // This name is delibeartely wrong because Knex made a mess
		}),
		knex.raw('ALTER INDEX "public"."locations_barcode_unique" RENAME TO "departments_barcode_unique";'),
		knex.schema.renameTable('locations', 'departments')
	])
};

exports.down = function(knex) {
	return Promise.all([
		knex.schema.renameTable('departments', 'locations'),
		knex.raw('ALTER INDEX "public"."departments_barcode_unique" RENAME TO "locations_barcode_unique";'),
		knex.schema.table('items', table => {
			table.foreign('location_id').references('locations.id')
		})
	])
}
