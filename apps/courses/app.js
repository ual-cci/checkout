const express = require('express')

const auth = require('../../src/js/authentication.js')
const CoursesController = require('./controller.js')

const app = express()

app.use((req, res, next) => {
	req.controller = new CoursesController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.set('views', __dirname + '/views')
app.get('/', auth.currentUserCan('courses_read'), (req, res) => {
	req.controller.getRoot(req, res)
})

app.get('/create', auth.currentUserCan('courses_create'), (req, res) => {
	req.controller.getCreate(req, res)
})

app.post('/create', auth.currentUserCan('courses_create'), (req, res) => {
	req.controller.postCreate(req, res)
})

app.get('/:id', auth.currentUserCan('courses_edit'), (req, res) => {
	req.controller.getSingle(req, res)
})

app.get('/:id/edit', auth.currentUserCan('courses_edit'), (req, res) => {
	req.controller.getEdit(req, res)
})

app.post('/:id/edit', auth.currentUserCan('courses_edit'), (req, res) => {
	req.controller.postEdit(req, res)
})

app.get('/:id/remove', auth.currentUserCan('courses_remove'), (req, res) => {
	req.controller.getRemove(req, res)
})

app.post('/:id/remove', auth.currentUserCan('courses_remove'), (req, res) => {
	req.controller.postRemove(req, res)
})

module.exports = config => app
