const express = require('express')

const PrintersController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new PrintersController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

// View
app.get('/', auth.currentUserCan('printers_read'), (req, res) => {
	req.controller.getRoot(req, res)
})

// Create
app.get('/create', auth.currentUserCan('printers_create'), (req, res) => {
	req.controller.getCreate(req, res)
})

app.post('/create', auth.currentUserCan('printers_create'), (req, res) => {
	req.controller.postCreate(req, res)
})

// Edit
app.get('/:id/edit', auth.currentUserCan('printers_edit'), (req, res) => {
	req.controller.getEdit(req, res)
})

app.post('/:id/edit', auth.currentUserCan('printers_edit'), (req, res) => {
	req.controller.postEdit(req, res)
})

// Remove
app.get('/:id/remove', auth.currentUserCan('printers_remove'), (req, res) => {
	req.controller.getRemove(req, res)
})

app.post('/:id/remove', auth.currentUserCan('printers_remove'), (req, res) => {
	req.controller.postRemove(req, res)
})

module.exports = config => app
