
const express = require('express')

const TemplatesController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new TemplatesController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCan('email_queue_read'), (req, res) => {
	req.controller.getRoot(req, res)
})

module.exports = config => app
