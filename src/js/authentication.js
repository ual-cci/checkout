const passport = require('@passport-next/passport')
const LocalStrategy = require('@passport-next/passport-local').Strategy
const crypto = require('crypto')
const Options = require('./options')()

const UsersModel = require('../models/users')
const PermissionsModel = require('../models/permissions')

const Authentication = {
	auth: (app) => {
		const users = new UsersModel()
		const permissions = new PermissionsModel()

		// Add support for local authentication
		passport.use(
			new LocalStrategy((email, password, done) => {
				let persist = {}
				users.getByEmail(email, 'all')
				.then(user => {
					// Does the email even exist?
					if (!user) {
						throw new Error('Invalid Email Address')
					}

					// Is there a password set?
					if (!user.pw_salt) {
						throw new Error('Account has no password')
					}

					// Is the user active?
					if (user.disable) {
						throw new Error('Account disabled')
					}

					// Have the password attempts been exceeded?
					if (user.pw_attempts >= Options.getInt('password_tries')) {
						throw new Error('Account locked')
					}

					// Persist the user for the promise chain
					persist.user = user

					return Authentication.hashPassword(password, user.pw_salt, user.pw_iterations)
				})
				.then(hash => {
					const {user} = persist
					persist.successful = false // Default to a failed login
					
					if (hash == user.pw_hash) {
						persist.successful = true // This is what makes the login work

						// Advise user of incorrect password attempts and reset to 0
						if (user.pw_attempts > 0) {
							persist.flash = {
								message: `There has been ${user.pw_attempts} attempt(s) to login to your account since you last logged in`
							}
							user.pw_attempts = 0
						}
					} else {
						user.pw_attempts++
						persist.flash = {
							message: 'Incorrect password'
						}
					}
					
					// Transparently check and update password hashes if necessary
					if (user.pw_iterations < process.env.USER_PW_ITERATIONS) {
						Authentication.generatePassword(password)
						.then(pw => {
							user.pw_hash = pw.hash
							user.pw_salt = pw.salt
							user.pw_iterations = pw.iterations

							let updateFields = {
								pw_attempts: user.pw_attempts,
								pw_hash: pw.hash,
								pw_salt: pw.salt,
								pw_iterations: pw.iterations
							}

							// Update user data
							users.update(user.id, updateFields).then(id => {
								console.log(`${id} password iterations updated to ${pw.iterations}`)
							})
						})
					}

					persist.user = user
				})
				.then(() => {
					const {user, flash} = persist
					// Pass the login status and flash messages to passport deserializer
					done(null, persist.successful ? {id: user.id} : false, flash)
				})
				.catch(err => {
					done(null, false, {
						message: err.message
					})
				})
			})
		)

		// Passport.js serialise user function
		passport.serializeUser(function(data, done) {
			done(null, data)
		})

		passport.deserializeUser(function(data, done) {
			const id = data.id
			users.query()
			.lookup(['printer', 'role', 'template'])
			.where([['id', id]]).retrieveSingle()
			.then(user => {
				if (user) {
					return permissions.getByRoleId(user.role_id).then(perms => {
						perms = perms.map(p => {
							return p.permission
						})
						if (data.km) {
							perms = perms.filter(p => {
								if (p == 'checkout_issue') return true
								if (p == 'items_return') return true
								if (p == 'items_broken') return true
								if (p == 'items_lost') return true
								if (p == 'items_sold') return true
								if (p == 'checkout_history') return true
								if (p == 'groups_override') return true
								if (p == 'users_create') return true
								if (p == 'print') return true
								return false
							})
						}
						user.permissions = perms
						return done(null, user)
					})
				} else {
					return done(null, false)
				}
			})
		})

		// Include support for passport and sessions
		app.use(passport.initialize())
		app.use(passport.session())
	},

	// Used to create a long salt for each individual user
	// returns a 256 byte / 512 character hex string
	generateSalt: (callback) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(256, (ex, salt) => {
				resolve(salt.toString('hex'))
			})
		})
	},

	// Hashes passwords through sha512 1000 times
	// returns a 512 byte / 1024 character hex string
	hashPassword: (password, salt, iterations) => {
		return new Promise((resolve, reject) => {
			crypto.pbkdf2(password, salt, iterations, 512, 'sha512', (err, hash) => {
				resolve(hash.toString('hex'))
			})
		})
	},

	// Utility function generates a salt and hash from a plain text password
	generatePassword: (password) => {
		return new Promise((resolve, reject) => {
			const iterations = parseInt(process.env.USER_PW_ITERATIONS, 10)
			Authentication.generateSalt().then(salt => {
				Authentication.hashPassword(password, salt, iterations).then(hash => {
					resolve({
						salt: salt,
						hash: hash,
						iterations: iterations
					})
				})
			})
		})
	},
	
	// Checks password meets requirements
	passwordRequirements: (password) => {
		if (!password)
			return 'No password entered'

		if (password.length < 8)
			return 'Password is less than 8 characters'

		if (password.match(/\d/g) === null)
			return 'Password does not contain any numbers'

		if (password.match(/[A-Z]/g) === null)
			return 'Password does not contain any uppercase characters'

		if (password.match(/[a-z]/g) === null)
			return 'Password does not contain any lowercase characters'

		return true
	},

	loggedIn: (req) => {
		// Is the user logged in?
		if (req.isAuthenticated() && req.user != undefined) {
			return true
		} else {
			return false
		}
	},

	isLoggedIn: (req, res, next) => {
		const status = Authentication.loggedIn(req)
		switch (status) {
			case true:
				return next()
			default:
			case false:
				req.flash('error', "Please login")
				res.redirect('/login')
				return
		}
	},

	userCan: (user, permission) => {
		if (typeof permission == 'object') {
			if (permission.or) {
				return permission.or.some(p => user.permissions.includes(p))
			} else if (permission.and) {
				return permission.and.every(p => user.permissions.includes(p))
			}
		} else {
			return user.permissions.includes(permission)
		}
	},

	_currentUserCheck: (permission, req, res, next) => {
		const status = Authentication.loggedIn(req)
		if (status) {
			var authorised = Authentication.userCan(req.user, permission)
			if (authorised) {
				return next()
			} else {
				res.status(403)
				res.render(__dirname + '/../views/403', {
					permission: permission,
					user_permissions: req.user.permissions
				})
			}
		} else {
			req.flash('error', "Please login")
			res.redirect('/login')
		}
	},

	currentUserCan: (permission) => {
		return (req, res, next) => {
			Authentication._currentUserCheck(permission, req, res, next)
		}
	},

	currentUserCanOrOptionOverride: (permission, option) => {
		return (req, res, next) => {
			// If option is true then show the page
			if (Options.getBoolean(option)) {
				return next()
			}

			// Otherwise check the permission
			Authentication._currentUserCheck(permission, req, res, next)
		}
	},

	APIuserCan: (permission) => {
		return (req, res, next) => {
			const status = Authentication.loggedIn(req)
			if (status) {
				const authorised = Authentication.userCan(req.user, permission)
				if (authorised) {
					return next()
				} else {
					res.json({status:'danger', message: 'Permission denied'})
				}
			} else {
				res.json({status:'danger', message: 'Please login'})
			}
		}
	}
}

module.exports = Authentication
