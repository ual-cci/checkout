const express = require('express')

const HistoryController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new HistoryController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCanOrOptionOverride('view_history'), (req, res) => {
	req.controller.getRoot(req, res)
})

module.exports = config => app
