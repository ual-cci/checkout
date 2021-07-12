const express = require('express')

const CatalogueController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new CatalogueController()
	next()
})

app.get('/', (req, res) => {
	req.controller.getRoot(req, res)
})

module.exports = config => app
