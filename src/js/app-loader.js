const fs = require('fs')
const path = require('path')
const helmet = require('helmet')

const templateLocals = require('../js/template-locals.js')

const ROOT = path.join(__dirname, '..', '..')
const APP_ROOT = path.join(ROOT, 'apps')

function loadApp(file) {
	if (fs.statSync(file).isDirectory()) {
		var config_file = path.join(file, '/config.json')

		if (fs.existsSync(config_file)) {
			// Parse the config into apps array
			var output = JSON.parse(fs.readFileSync(config_file))
			output.uid = file
			if (!output.priority) output.priority = 100
			output.app = path.join(file, 'app.js')

			output.subapps = []

			// Check for sub apps directory
			var subapp_path = path.join(file, 'apps')
			if (fs.existsSync(subapp_path)) {
				output.subapps = loadApps(subapp_path)
			}

			output.subapps.sort(byPriority)

			return output
		}
	} else {
		return false
	}
}

function byPriority(a, b) {
	return a.priority < b.priority
}

function loadApps(root) {
	const files = fs.readdirSync(root)

	const apps = files.map(f => {
		return loadApp(path.join(root, f))
	}).filter(f => f)

	apps.sort(byPriority)

	return apps
}

function setupAppRoute(mainApp, childApp) {
	var new_app = require(childApp.app)(childApp)
	new_app.use(helmet())
	mainApp.use(`/${childApp.path}`, new_app)
	new_app.locals.basedir = ROOT

	if (childApp.subapps.length > 0) {
		childApp.subapps.forEach(subApp => {
			setupAppRoute(mainApp, subApp)
		})
	}
}

function routeApps(app, apps) {
	apps.forEach(childApp => {
		setupAppRoute(app, childApp);
	})
}

module.exports = (app) => {
	// Loop through main app director contents
	const apps = loadApps(APP_ROOT)

	// Load template locals;
	app.use(templateLocals(apps))

	// Route apps
	routeApps(app, apps)
}
