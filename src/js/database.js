const fs = require('fs')
const knex = require('knex')

const {constructTarget} = require('./utils.js');

module.exports = knex({
	client: 'pg',
	connection: constructTarget()
})
