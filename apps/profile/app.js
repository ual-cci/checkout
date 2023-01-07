const express = require('express')

const auth = require('../../src/js/authentication.js')
const ProfileController = require('./controller.js')

const app = express()

app.use((req, res, next) => {
	req.controller = new ProfileController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.set('views', __dirname + '/views')

app.get('/', auth.currentUserCan('edit_profile'), (req, res) => {
	req.controller.getRoot(req, res)
})

app.post('/', auth.currentUserCan('edit_profile'), (req, res) => {
	req.controller.postRoot(req, res)
})

module.exports = config => app
