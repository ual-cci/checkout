const express = require('express')

const KioskController = require('./controller')
const auth = require('../../src/js/authentication.js')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new KioskController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', (req, res) => {
	req.controller.getRoot(req, res)
})

app.post('/', (req, res) => {
	req.controller.postRoot(req, res)
})

app.get('/enable', auth.currentUserCan('activate_kiosk_mode'), (req, res) => {
	req.controller.getEnable(req, res)
})

app.post('/enable', auth.currentUserCan('activate_kiosk_mode'), (req, res) => {
	req.controller.postEnable(req, res)
})

app.get('/fixed', (req, res) => {
	req.controller.getFixed(req, res)
})

app.get('/logout', (req, res) => {
	req.controller.getLogout(req, res)
})

app.get('/exit', (req, res) => {
	req.controller.getExit(req, res)
})

module.exports = config => app
