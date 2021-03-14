const session = require('express-session')
const cookie = require('cookie-parser')
const body = require('body-parser')
const csrf = require('csurf')

var PostgreSqlStore = require('connect-pg-simple')(session)
const {constructTarget} = require('../js/utils.js')

module.exports =  function(app, io) {
	var store = new PostgreSqlStore({
		conString: constructTarget(),
	})

	app.use(cookie())
	app.use(session({
		cookie: {
			maxAge: 31 * 24 * 60 * 60 * 1000
		},
		store: store,
		name: process.env.APP_COOKIE ? process.env.APP_COOKIE : 'checkout_session',
		secret: process.env.APP_SECRET,
		resave: false,
		saveUninitialized: false,
		rolling: false,
		unset: 'destroy'
	}))

	app.use(body.urlencoded({extended: true}))
	app.use(body.json())

	app.use(function(req, res, next) {
		req.saveSessionAndRedirect = function (a, b) {
			req.session.save(function(err) {
				if (err) throw new Error(err)
				if (b) {
					res.redirect(a, b)
				} else {
					res.redirect(a)
				}
			})
		}
		return next()
	})

	app.use((req, res, next) => {
		if (req.url.match(/^\/api/i)) {
			next();
		} else {
			csrf()(req, res, next);
		}
	} );

	app.use((err, req, res, next) => {
		if (err.code == 'EBADCSRFTOKEN') {
			return res.status(400).send('400')
		}
		next(err);
	} );
}
