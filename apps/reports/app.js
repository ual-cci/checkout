const express = require('express')

const ItemController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new ItemController()
	res.locals.breadcrumb.push({name: app.locals.app_title})
	next()
})

app.get('/', auth.isLoggedIn, (req, res) => {
	req.saveSessionAndRedirect('/items')
})

app.get('/insurance', auth.currentUserCan('generate_insurance_report'), (req, res) => {
	req.controller.getInsurance(req, res)
})

app.post('/insurance', auth.currentUserCan('generate_insurance_report'), (req, res) => {
	req.controller.postInsurance(req, res)
})

module.exports = config => app
