const auth = require('./authentication')

var gitRev = require('git-rev')
var git = ''

gitRev.short(str => {
	git = str
})

function templateLocals(req, res, next) {
	res.locals.git = git
	if (process.env.NODE_ENV == "development") res.locals.dev = true
	if (req.session.kioskMode > 0) res.locals.kioskMode = true
	res.locals.loggedInUser = req.user
	res.locals.currentUserCan = function(perm) {
		return auth.userCan(req.user,perm)
	}
	res.locals.moment = require('moment')
	res.locals.config = {
		app_name: process.env.APP_NAME,
		org_name: process.env.ORG_NAME,
		pw_tries: process.env.USER_PW_TRIES
	}
	next()
}

module.exports = function(apps) {
	return templateLocals
}
