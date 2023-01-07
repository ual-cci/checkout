const fs = require('fs')
const path = require('path')
const helmet = require('helmet')

const ROOT = path.join(__dirname, '..', '..')
const APP_ROOT = path.join(ROOT, 'apps')

// Read the folder and prepare a list of apps to load
function loadApps(root) {
	const files = fs.readdirSync(root)
	const apps = files.map(f => {
		return loadApp(path.join(root, f))
	}).filter(f => f)
	
	return apps
}

// Iterate through the apps folder looking for config.json which is a marker of an app
function loadApp(file) {
	if (fs.statSync(file).isDirectory()) {
		const config_file = path.join(file, '/config.json')

		if (fs.existsSync(config_file)) {
			let output = JSON.parse(fs.readFileSync(config_file))
			output.uid = file
			output.app = path.join(file, 'app.js')
			return output
		}
	} else {
		return false
	}
}

// Create the apps and add them as subapps to the main app
function routeApps(mainApp, apps) {
	apps.forEach(childApp => {
		// Create the app
		const new_app = require(childApp.app)(childApp)
		new_app.locals.app_title = childApp.title
		new_app.use(helmet())

		// Use the app
		mainApp.use(`/${childApp.path}`, new_app)
	})
}

module.exports = (app) => {
	const apps = loadApps(APP_ROOT)
	routeApps(app, apps)
}
