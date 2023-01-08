const auth = require('./authentication')
const Options = require('./options')()
const Printers = require('../models/printers')
const Templates = require('../models/templates')
const moment = require('moment')


const printers = new Printers()
const templates = new Templates()

var gitRev = require('git-rev')
var git = ''

gitRev.short(str => {
	git = str
})

function templateLocals(req, res, next) {
	Promise.all([
		printers.getAll(),
		templates.getAll()
	])
	.then(([printers, templates]) => {
		res.locals.printers = printers
		res.locals.templates = templates

		res.locals.breadcrumb = []
		res.locals.git = git
		if (process.env.NODE_ENV == "development") res.locals.dev = true
		if (req.session.kioskMode > 0) res.locals.kioskMode = true
		if (req.csrfToken) res.locals.csrf = req.csrfToken()
		res.locals.loggedInUser = req.user
		res.locals.currentUserCan = (perm) => {
			return auth.userCan(req.user,perm)
		}
		res.locals.Options = {}
		res.locals.Options.get = Options.getText
		res.locals.Options.getBoolean = Options.getBoolean
		res.locals.moment = moment

		next()
	})
}

module.exports = () => {
	return templateLocals
}
