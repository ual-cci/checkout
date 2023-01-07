const	express = require('express')

const GroupController = require('./controller.js')
const auth = require('../../src/js/authentication.js')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new GroupController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCan('groups_read'), function(req, res) {
	req.controller.getRoot(req, res)
})

app.get('/create', auth.currentUserCan('groups_create'), function(req, res) {
	req.controller.getCreate(req, res)
})

app.post('/create', auth.currentUserCan('groups_create'), function(req, res) {
	req.controller.postCreate(req, res)
})

app.get('/:id', auth.currentUserCan('groups_edit'), function(req, res) {
	req.controller.getSingle(req, res)
})

app.get('/:id/edit', auth.currentUserCan('groups_edit'), function(req, res) {
	req.controller.getEdit(req, res)
})

app.post('/:id/edit', auth.currentUserCan('groups_edit'), function(req, res) {
	req.controller.postEdit(req, res)
})

app.get('/:id/remove', auth.currentUserCan('groups_remove'), function(req, res) {
	req.controller.getRemove(req, res)
})

app.post('/:id/remove', auth.currentUserCan('groups_remove'), function(req, res) {
	req.controller.postRemove(req, res)
})

module.exports = config => app
