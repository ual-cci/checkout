const MAX_ATTEMPTS = 3

function createFactory(knex, {attempt = 0, createFunc, table, num = 5}) {
	return knex(table)
		.del()
		.then(function() {
			const items = []

			for (let i = 0; i < num; i++) {
				items.push(createFunc(i))
			}

			return knex(table).insert(items)
		})
		.catch((err) => {
			if (attempt > MAX_ATTEMPTS) {
				return Promise.reject(err)
			}

			return createFactory(knex, {attempt: attempt + 1, createFunc, table})
		})
}

function seed() {
	return Promise.resolve()
}

module.exports = { MAX_ATTEMPTS, createFactory, seed }
