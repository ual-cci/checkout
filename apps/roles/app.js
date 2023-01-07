const	express = require('express')

const RoleController = require('./controller.js')
const auth = require('../../src/js/authentication.js')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new RoleController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCan('roles_read'), function(req, res) {
	req.controller.getRoot(req, res)
})

app.get('/create', auth.currentUserCan('roles_create'), function(req, res) {
	req.controller.getCreate(req, res)
})

app.post('/create', auth.currentUserCan('roles_create'), function(req, res) {
	req.controller.postCreate(req, res)
})

app.get('/:id/edit', auth.currentUserCan('roles_edit'), function(req, res) {
	req.controller.getEdit(req, res)
})

app.post('/:id/edit', auth.currentUserCan('roles_edit'), function(req, res) {
	req.controller.postEdit(req, res)
})

app.get('/:id/permissions', auth.currentUserCan('roles_set_permissions'), function(req, res) {
	req.controller.getPermissions(req, res)
})

app.post('/:id/permissions', auth.currentUserCan('roles_set_permissions'), function(req, res) {
	req.controller.postPermissions(req, res)
})

app.get('/:id/remove', auth.currentUserCan('roles_remove'), function(req, res) {
	req.controller.getRemove(req, res)
})

app.post('/:id/remove', auth.currentUserCan('roles_remove'), function(req, res) {
	req.controller.postRemove(req, res)
})

module.exports = config => app
