const express = require('express')

const UsersController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new UsersController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

// List view
app.get('/', auth.currentUserCan('users_read'), (req, res) => {
	req.controller.getRoot(req, res)
})

// Edit multiple
app.post('/edit', auth.currentUserCan('users_multi_edit'), (req, res) => {
	req.controller.postMultiEdit(req, res)
})

// Remove multiple
app.post('/remove', auth.currentUserCan('users_multi_remove'), (req, res) => {
	req.controller.postMultiRemove(req, res)
})

// Email multiple users
app.post('/email', auth.currentUserCan('users_email'), (req, res) => {
	req.controller.postMultiEmail(req, res)
})

// Import users
app.get('/import', auth.currentUserCan('users_import'), (req, res) => {
	req.controller.getImport(req, res)
})

app.post('/process', auth.currentUserCan('users_import'), (req, res) => {
	req.controller.postImportProcess(req, res)
})

app.post('/import', auth.currentUserCan('users_import'), (req, res) => {
	req.controller.postImportData(req, res)
})

// View user
app.get('/:id', auth.currentUserCan('users_read'), (req, res) => {
	req.controller.getUser(req, res)
})

// Edit user
app.get('/:id/edit', auth.currentUserCan('users_edit'), (req, res) => {
	req.controller.getUserEdit(req, res)
})

app.post('/:id/edit', auth.currentUserCan('users_edit'), (req, res) => {
	req.controller.postUserEdit(req, res)
})

// Remove user
app.get('/:id/remove', auth.currentUserCan('users_remove'), (req, res) => {
	req.controller.getUserRemove(req, res)
})

app.post('/:id/remove', auth.currentUserCan('users_remove'), (req, res) => {
	req.controller.postUserRemove(req, res)
})

// Reset password attempts for user
app.get('/:id/email', auth.currentUserCan('users_email'), (req, res) => {
	req.controller.getEmail(req, res)
})

// Reset password attempts for user
app.get('/:id/reset', auth.currentUserCan('users_reset_password_attempts'), (req, res) => {
	req.controller.getReset(req, res)
})

module.exports = config => app
