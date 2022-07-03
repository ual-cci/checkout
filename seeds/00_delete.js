function deleteTables(knex, tables) {
	return Promise.all(tables.map(t => {
		return knex(t).del()
	}))
}

exports.seed = (knex) => {
	return deleteTables(knex, ['users'])
		.then(() => deleteTables(knex, ['permissions']))
		.then(() => deleteTables(knex, [
			'courses',
			'departments',
			'groups',
			'locations',
			'printers',
			'roles',
			'years',
		]))
}
