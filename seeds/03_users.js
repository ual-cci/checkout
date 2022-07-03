const {faker} = require('@faker-js/faker')
const auth = require('../src/js/authentication.js')
const { createFactory } = require('./_helper')

faker.locale = 'en_GB'

function createUsers(knex, printerId, courseId, yearId, roleId, password) {
	return createFactory(knex, {
		table: 'users',
		num: 3,
		createFunc: () => {
			const email = faker.internet.email()
			console.log(`User login: ${email}`)
			return {
				email: email,
				name: [faker.name.firstName(), faker.name.lastName()].join(' '),
				pw_hash: password.hash,
				pw_salt: password.salt,
				printer_id: printerId,
				course_id: courseId,
				year_id: yearId,
				barcode: faker.phone.number().split(' ').join(''),
				pw_iterations: password.iterations,
				role_id: roleId
			}
		}
	})
}

function getPrinter(knex) {
	return knex('printers')
		.first()
}

function getCourse(knex) {
	return knex('courses')
		.first()
}

function getYear(knex) {
	return knex('years')
		.first()
}

function getRole(knex) {
	return knex('roles')
		.first()
}

function getPassword(pwd) {
	return new Promise((resolve, reject) => {
		auth.generatePassword(pwd, password => resolve(password))
	})
}

exports.seed = (knex) => {
	const TEST_PASSWORD = 'password'
	console.log(`Test User Password: "${TEST_PASSWORD}"`)
	console.log('You should delete these users before going to production as they have full access.')
	return Promise.all([
		getPrinter(knex),
		getCourse(knex),
		getYear(knex),
		getRole(knex),
		getPassword(TEST_PASSWORD)
	])
	.then(([printer, course, year, role, password]) => {
		return createUsers(knex, printer.id, course.id, year.id, role.id, password)
	})
}
