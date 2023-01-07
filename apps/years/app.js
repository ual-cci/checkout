
const express = require('express')

const YearsController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new YearsController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCan('years_read'), (req, res) => {
	req.controller.getRoot(req, res)
})

app.get('/create', auth.currentUserCan('years_create'), (req, res) => {
	req.controller.getCreate(req, res)
})

app.post('/create', auth.currentUserCan('years_create'), (req, res) => {
	req.controller.postCreate(req, res)
})

app.get('/:id', auth.currentUserCan('years_edit'), (req, res) => {
	req.controller.getSingle(req, res)
})

app.get('/:id/edit', auth.currentUserCan('years_edit'), (req, res) => {
	req.controller.getEdit(req, res)
})

app.post('/:id/edit', auth.currentUserCan('years_edit'), (req, res) => {
	req.controller.postEdit(req, res)
})

app.get('/:id/remove', auth.currentUserCan('years_remove'), (req, res) => {
	req.controller.getRemove(req, res)
})

app.post('/:id/remove', auth.currentUserCan('years_remove'), (req, res) => {
	req.controller.postRemove(req, res)
})

module.exports = config => app
