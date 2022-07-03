const {faker} = require('@faker-js/faker')
const { createFactory } = require('./_helper.js')

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

function createDepartments(knex) {
	return createFactory(knex, {
		table: 'departments',
		createFunc: () => {
			return {
				name: faker.name.jobArea()
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
				limiter: faker.datatype.number(10),
				duration: `${ faker.datatype.number(10) + 1 } days`
			}
		}
	})
}

function createLocations(knex) {
	return createFactory(knex, {
		table: 'locations',
		createFunc: () => {
			return {
				name: faker.company.companyName(),
				barcode: faker.datatype.uuid().substring(0, 6)
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
			{ name: 'N/A' },
		]))
}

exports.seed = (knex) => {
	return Promise.all([
		createCourses(knex),
		createDepartments(knex),
		createGroups(knex),
		createLocations(knex),
		createPrinters(knex),
		createRoles(knex),
		createYears(knex),
	])
}
