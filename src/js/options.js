const OptionsDB = require('../../src/models/options')

const Options = {
	_opts: [],
	get: (key) => {
		return Options._opts[key] ? Options._opts[key] : null
	},
	getInt: (key) => {
		const opt = Options.get(key)
		if (opt) {
			return parseInt(opt.value)
		} else {
			return ''
		}
	},
	getText: (key) => {
		const opt = Options.get(key)
		if (opt) {
			return opt.value
		} else {
			return ''
		}
	},
	getBoolean: (key) => {
		const opt = Options.getText(key)
		if (opt == 'true') {
			return true
		} else if (opt == 'false') {
			return false
		} else {
			return null
		}
	},
	getAll: () => {
		return Options._opts
	},
	_set: (key, value, id) => {
		if (Options._opts[key]) {
			Options._opts[key].value = value
			Options._opts[key].overridden = true
			if (id) Options._opts[key].id = id
			return true
		} else {
			return false
		}
	},
	set: (key, value, cb) => {
		var optsDB = new OptionsDB()
		if (Options._opts[key].id) {
			optsDB.update(Options._opts[key].id, {
				key: key,
				value: value
			}).then(result => {
				Options._set(key, value, Options._opts[key].id)
				cb(true)
			})
		} else {
			optsDB.create({
				key: key,
				value: value
			}).then(result => {
				Options._set(key, value, result[0])
				cb(true)
			})
		}
	},
	reset: (key, cb) => {
		if (Options._opts[key]) {
			var optsDB = new OptionsDB()
			optsDB.remove(Options._opts[key].id).then(result => {
				Options._set(key, Options._opts[key].default, Options._opts[key].id)
				Options._opts[key].value = Options._opts[key].default
				Options._opts[key].overridden = false
				delete Options._opts[key].id
				cb(true)
			})
		} else {
			cb(false)
		}
	},
	_firstRun: () => {
		// Load option defaults file
		Options._opts = require('../option_defaults.json')

		// Process options into value field
		Object.keys(Options._opts).forEach((k) => {
			Options._opts[k].value = Options._opts[k].default
			Options._opts[k].overridden = false
		})

		// Check database for overridden options
		var optsDB = new OptionsDB()
		optsDB.getAll().then(options => {
			options.forEach(o => {
				Options._set(o.key, o.value, o.id)
			})
			Options.ready = true
		})
	},

	ready: false
}

module.exports = function() {
	if (global.CheckoutOptions === undefined) {
		Options._firstRun();
		global.CheckoutOptions = Options
	}
	return global.CheckoutOptions;
}
