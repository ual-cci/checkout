module.exports = (app) => {
	// Error 404
	app.use((req, res, next) => {
		res.status(404)
		res.render('404')
	})

	// Error handling
	app.use((err, req, res, next) => {
		if (err.code == 'EBADCSRFTOKEN') {
			res.status(400)
			res.render('400')
		} else {
			res.status(500);
			res.render('500', {error: (res.locals.dev ? err.stack : undefined)})
		}
	})
}
