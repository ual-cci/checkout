const express = require('express')
const auth = require('../../src/js/authentication.js')

const app = express()

app.set('views', __dirname + '/views')

app.get('/', auth.isLoggedIn, (req, res) => {
	// Always go to checkout if in Kiosk mode
	if (req.session.kioskMode > 0) {
		req.saveSessionAndRedirect('/checkout')
	} else {
		// Check user has a role home, they should, but ...
		if (req.user.role_home) {
			req.saveSessionAndRedirect(req.user.role_home)
		} else {
				res.render('blank')
		}
	}
})

module.exports = config => app
