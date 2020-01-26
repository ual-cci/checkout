require('dotenv-safe').config({allowEmptyValues: true});
const database = require('../src/js/database')

function testDB() {
	console.log('Checking for DB connection...')
	database.raw('SELECT 1+1 AS result;').then(r => {
		console.log('✅ Database ready.')
		process.exit(0)
	}).catch(err => {
		console.log('⏱ Database unavailable, sleeping 1 second.')
		setTimeout(testDB, 1000)
	})
}

testDB();
