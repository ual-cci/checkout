const {faker} = require('@faker-js/faker')
const { createFactory } = require('./_helper')

function createPermissions(knex, id) {
	var allPerms = Object.keys(require('../apps/roles/all_permissions.json'))

	allPerms = allPerms.map((p) => {
		return {role_id: id, permission: p}
	})

	return knex('permissions')
		.del()
		.then(() => knex('permissions').insert(allPerms))
}

exports.seed = (knex) => {
	return knex('roles')
		.select('id')
		.first()
		.then(({ id }) => createPermissions(knex, id))
}
