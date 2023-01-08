const auth = require('./authentication')
const Options = require('./options')()
const Printers = require('../models/printers')
const printers = new Printers()

var gitRev = require('git-rev')
var git = ''

gitRev.short(str => {
	git = str
})

function templateLocals(req, res, next) {
	printers.getAll().then((printers) => {
		res.locals.printers = printers
	})
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
	res.locals.moment = require('moment')
	next()
}

module.exports = () => {
	return templateLocals
}
