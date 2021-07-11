
exports.up = function(knex) {
	return Promise.resolve()
		.then(() => knex('departments').select('id', 'name', 'barcode'))
		// .then((rows) => knex('locations').insert(rows))
		.then(() => knex('departments').del())
}

exports.down = function(knex) {
	return Promise.resolve()
		.then(() => knex('locations').select('id', 'name', 'barcode'))
		.then((rows) => knex('departments').insert(rows))
		.then(() => knex('locations').del())
}
