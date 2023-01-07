const	express = require('express')

const ReservationController = require('./controller.js')
const auth = require('../../src/js/authentication.js')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new ReservationController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.isLoggedIn, (req, res) => {
	req.controller.getRoot(req, res)
})

app.get('/:id/edit', auth.isLoggedIn, (req, res) => {
	req.controller.getEdit(req, res)
})

app.post('/:id/edit', auth.isLoggedIn, (req, res) => {
	req.controller.postEdit(req, res)
})

app.get('/:id/remove', auth.isLoggedIn, (req, res) => {
	req.controller.getRemove(req, res)
})

app.post('/:id/remove', auth.isLoggedIn, (req, res) => {
	req.controller.postRemove(req, res)
})

module.exports = config => app
