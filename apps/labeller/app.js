const express = require('express')

const LabellerController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new LabellerController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCan('labeller'), (req, res) => {
	req.controller.getRoot(req, res)
})

app.post('/', auth.currentUserCan('labeller'), (req, res) => {
	req.controller.postRoot(req, res)
})

app.get('/reprint', auth.currentUserCan('reprint'), (req, res) => {
	req.controller.getReprint(req, res)
})

app.post('/reprint', auth.currentUserCan('reprint'), (req, res) => {
	req.controller.postReprint(req, res)
})

module.exports = config => app
