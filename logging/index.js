const bunyan = require('bunyan');

function createLogger(name, stdout = true) {
	const streams = [
		{
			level: 'info',
			path: `${__dirname}/logs/${name}.log`
		},
		{
			level: 'error',
			path: `${__dirname}/logs/${name}-error.log`
		}
	]

	if (stdout) {
		streams.push({
			level: 'info',
			stream: process.stdout // log INFO and above to stdout
		})
	}
	return bunyan.createLogger({
		name,
		streams
	})
}

module.exports = {
	queries: createLogger('queries', false),
	general: createLogger('general'),
}
