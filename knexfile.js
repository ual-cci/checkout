// Update with your config settings.
require('dotenv-safe').config({allowEmptyValues: true});

module.exports = {

	development: {
		client: 'postgresql',
		connection: {
			host: process.env.POSTGRES_HOST,
			port: process.env.POSTGRES_PORT,
			database: process.env.POSTGRES_DB,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD
		},
	},

	staging: {
		client: 'postgresql',
		connection: {
			host: process.env.POSTGRES_HOST,
			port: process.env.POSTGRES_PORT,
			database: process.env.POSTGRES_DB,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD
		}
	},

	production: {
		client: 'postgresql',
		connection: {
			host: process.env.POSTGRES_HOST,
			port: process.env.POSTGRES_PORT,
			database: process.env.POSTGRES_DB,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD
		},
		pool: {min: 1, max: 7}
	}
}
