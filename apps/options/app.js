const express = require('express')

const auth = require('../../src/js/authentication.js')

const OptionsController = require('./controller.js')
const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new OptionsController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCan('options_read'), function(req, res) {
	req.controller.getRoot(req, res)
})

app.get('/:id/edit', auth.currentUserCan('options_edit'), function(req, res) {
	req.controller.getEdit(req, res)
})

app.post('/:id/edit', auth.currentUserCan('options_edit'), function(req, res) {
	req.controller.postEdit(req, res)
})

app.get('/:id/reset', auth.currentUserCan('options_edit'), function(req, res) {
	req.controller.getReset(req, res)
})

app.post('/:id/reset', auth.currentUserCan('options_edit'), function(req, res) {
	req.controller.postReset(req, res)
})

module.exports = config => app
