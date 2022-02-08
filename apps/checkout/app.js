const express = require('express')

const auth = require('../../src/js/authentication.js')
const CheckoutController = require('./controller.js')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new CheckoutController()
	next()
})

app.get('/', auth.currentUserCan({or:['checkout_issue','items_return','checkout_audit','checkout_history','print','users_create','reservations_create']}), (req, res) => {
	req.controller.getRoot(req, res)
})

module.exports = config => app
