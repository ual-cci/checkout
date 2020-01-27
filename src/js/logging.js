var __root = '../..'
var __static = __root + '/static'
var __src = __root + '/src'
var __views = __src + '/views'
var __js = __src + '/js'

const bunyan = require('bunyan')
const bunyanMiddleware = require('bunyan-middleware')

const crypto = require('crypto')
const randomKey = crypto.randomBytes(256)

const Options = require('./options')()

// Bunyan logging
var bunyanConfig = {
	name: Options.get('application_name'),
	streams: []
}

if (process.env.LOG_STDOUT) {
	bunyanConfig.streams.push({
			level: 'debug',
			stream: process.stdout
	})
	bunyanConfig.streams.push({
		level: 'error',
		stream: process.stderr
	})
}

if (process.env.LOG_PATH) {
	bunyanConfig.streams.push({
		type: "rotating-file",
		path: process.env.LOG_PATH,
		period: '1d', // rotates every day
		count: 7 // keeps 7 days
	})
}

var logger = bunyan.createLogger(bunyanConfig)

function loggingMiddleware(req, res, next) {
	var log = req.log
	function logAThing(level, params, req) {
		params.ip = req.connection.remoteAddress //TODO: this will only be correct when behind a reverse proxy, if app.set('trust proxy') is enabled!
		if (! params.sensitive) {
			params.sensitive = {}
		}
		if (req.user) {
			params.sensitive._user = {
				uuid: req.user.uuid,
				firstname: req.user.firstname,
				lastname: req.user.lastname,
				email: req.user.email
			}
			params.anon_userid = crypto.createHash('sha1').update(req.user.id + randomKey).digest('base64')
		}
		if (req.sessionID) {
			params.sensitive.sessionID = req.sessionID
			params.anon_sessionId = crypto.createHash('sha1').update(req.sessionID + randomKey).digest('base64')
		}
		if (params.sensitive) {
			log[level](params)
			params.sanitised = true
			delete params.sensitive
		}
		log[level](params)
	}

	req.log = {
		info: function (params) {
			logAThing('info', params , req)
		},
		debug: function (params) {
			logAThing('debug', params , req)
		},
		warn: function (params) {
			logAThing('warn', params , req)
		},
		error: function (params) {
			logAThing('error', params , req)
		},
		fatal: function (params) {
			logAThing('fatal', params , req)
		}
	}
	next()
}

module.exports = {
	installMiddleware: function (app) {
		app.use(bunyanMiddleware({logger: logger, level: "trace"}))
		app.use(loggingMiddleware)
	},
	log: logger
}
