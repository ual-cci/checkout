const express = require('express')
const auth = require('../../src/js/authentication.js')
const Options = require('../../src/js/options')()

const app = express()

app.set('views', __dirname + '/views')

app.get('/', (req, res) => {
	// Always go to checkout if in Kiosk mode
	if (req.session.kioskMode > 0) {
		req.saveSessionAndRedirect('/checkout')
	} else {
		if (!req.user && Options.getBoolean('public_catalogue')) {
			res.render('options')
		} else {
			if (!req.isAuthenticated()) {
				req.saveSessionAndRedirect('/login')
			} else if (req.user.role_home) {
				req.saveSessionAndRedirect(req.user.role_home)
			} else {
				res.render('blank')
			}
		}
	}
})

app.get('/shortcuts', auth.isLoggedIn, (req,res) => {
	res.render('shortcuts')
})

module.exports = config => app
