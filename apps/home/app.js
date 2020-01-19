const express = require('express')
const auth = require('../../src/js/authentication.js')

const app = express()

app.set('views', __dirname + '/views')

app.get('/', auth.isLoggedIn, (req, res) => {
	if (req.user.role_home) {
		if (req.user.role_home == '/checkout') {
			if (auth.userCan(req.user, 'checkout_issue',{or:['checkout_return','print','checkout_audit','checkout_history','checkout_new_user','checkout_new_reservation']})) {
				req.saveSessionAndRedirect('/checkout')
			} else {
				res.render('index')
			}
		} else {
			req.saveSessionAndRedirect(req.user.role_home)
		}
	} else {
		res.render('index')
	}
})

module.exports = config => app
