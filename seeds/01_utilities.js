const {faker} = require('@faker-js/faker')
const {createFactory} = require('../src/js/seed_helper')

function createCourses(knex) {
	return createFactory(knex, {
		table: 'courses',
		createFunc: () => {
			return {
				name: faker.commerce.department()
			}
		}
	})
}

function createGroups(knex) {
	return createFactory(knex, {
		table: 'groups',
		createFunc: () => {
			return {
				name: faker.commerce.productName(),
				limiter: faker.number.int(10),
				duration: `${faker.number.int(10) + 1} days`
			}
		}
	})
}

function createLocations(knex) {
	return createFactory(knex, {
		table: 'locations',
		createFunc: () => {
			return {
				name: faker.company.name(),
				barcode: faker.string.uuid().substring(0, 6)
			}
		}
	})
}

function createPrinters(knex) {
	return createFactory(knex, {
		table: 'printers',
		createFunc: () => {
			return {
				name: faker.hacker.noun(),
				url: faker.internet.url()
			}
		}
	})
}

function createRoles(knex) {
	return knex('roles')
		.del()
		.then(() => knex('roles').insert({ name: 'Super Admin' }))
}

function createYears(knex) {
	return knex('years')
		.del()
		.then(() => knex('years').insert([
			{ name: '1st Year' },
			{ name: '2nd Year' },
			{ name: '3rd Year' },
			{ name: 'Staff' },
			{ name: 'Technician' },
			{ name: 'N/A' },
		]))
}

exports.seed = (knex) => {
	return Promise.all([
		createCourses(knex),
		createGroups(knex),
		createLocations(knex),
		createPrinters(knex),
		createRoles(knex),
		createYears(knex),
	])
}
