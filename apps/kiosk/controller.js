const BaseController = require('../../src/js/common/BaseController.js')

const config = require('./config.json')
const auth = require('../../src/js/authentication')
const Options = require('../../src/js/options')()

const Users = require('../../src/models/users')

class KioskController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			users: new Users()
		}
	}

	getRoot(req, res) {
		if (req.isAuthenticated()) {
			if (!req.session.kioskMode > 0) {
				res.render('confirm')
			} else {
				req.session.destroy()
				res.redirect('/')
			}
		} else {
			if (req.session.kioskMode > 0) {
				res.render('login')
			} else {
				res.redirect('/')
			}
		}
	}

	postRoot(req, res) {
		if (req.session.kioskMode > 0) {
			this.models.users.getByBarcode(req.body.barcode)
			.then(user => {
				if (user) {
					req.login({id: user.id, km: true}, err => {
						if (err) throw new Error(err)
						req.session.kioskMode = Options.getText('kiosk_tries')
						req.saveSessionAndRedirect('/checkout')
					})
				} else {
					req.session.kioskMode--
					if (req.session.kioskMode > 0) {
						req.flash('danger', 'Unknown barcode')
						req.saveSessionAndRedirect('/kiosk')
					} else {
						req.logout()
						delete req.session.kioskMode
						req.flash('danger', 'Kiosk mode disabled')
						req.saveSessionAndRedirect('/login')
					}
				}
			})
		} else {
			req.logout()
			delete req.session.kioskMode
			req.flash('danger', 'Kiosk mode not enabled')
			req.saveSessionAndRedirect('/login')
		}
	}


	getEnable(req, res) {
		if (req.session.kioskMode > 0) {
			res.redirect('/kiosk')
		} else {
			res.render('confirm')
		}
	}

	postEnable(req, res) {
		req.session.kioskMode = Options.getText('kiosk_tries')
		req.logout()
		req.saveSessionAndRedirect('/kiosk')
	}

	getFixed(req, res) {
		let kiosks = process.env.KIOSKS
		if (kiosks && kiosks.includes(req.query.serialNumber)) {
			req.session.kioskMode = Options.getText('kiosk_tries')
			req.logout()
		}
		req.saveSessionAndRedirect('/kiosk')
	}

	getLogout(req, res) {
		req.logout()
		req.saveSessionAndRedirect('/kiosk')
	}

	getExit(req, res) {
		delete req.session.kioskMode
		req.saveSessionAndRedirect('/login')
	}
}

module.exports = KioskController
