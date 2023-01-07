const express = require('express')

const ItemController = require('./controller')
const auth = require('../../src/js/authentication')

const app = express()

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new ItemController()
	res.locals.breadcrumb.push({name: app.locals.app_title, url: app.mountpath})
	next()
})

app.get('/', auth.currentUserCan('items_read'), (req, res) => {
	req.controller.getRoot(req, res)
})

app.post('/label', auth.currentUserCan('print'), (req, res) => {
	req.controller.getMultiPrint(req, res)
})

app.post('/edit', auth.currentUserCan('items_multi_edit'), (req, res) => {
	req.controller.postMultiEdit(req, res)
})

app.post('/remove', auth.currentUserCan('items_multi_remove'), (req, res) => {
	req.controller.postMultiRemove(req, res)
})

// Import items
app.get('/import', auth.currentUserCan('items_import'), (req, res) => {
	req.controller.getImport(req, res)
})

app.post('/process', auth.currentUserCan('items_import'), (req, res) => {
	req.controller.postImportProcess(req, res)
})

app.post('/import', auth.currentUserCan('items_import'), (req, res) => {
	req.controller.postImportData(req, res)
})

// Create item
app.get('/create', auth.currentUserCan('items_create'), (req, res) => {
	req.controller.getCreate(req, res)
})

// Clone item
app.get('/clone/:id', auth.currentUserCan('items_clone'), (req, res) => {
	req.controller.getTemplateItem(req, res)
})

app.post('/create', auth.currentUserCan('items_create'), (req, res) => {
	req.controller.postCreate(req, res)
})

// List an item
app.get('/:id', auth.currentUserCan('items_read'), (req, res) => {
	req.controller.getItem(req, res)
})

// Reprint an item
app.get('/:id/label', auth.currentUserCan('print'), (req, res) => {
	req.controller.getLabel(req, res)
})

// Edit item form
app.get('/:id/edit', auth.currentUserCan('items_edit'), (req, res) => {
	req.controller.getEdit(req, res)
})

// Edit item handler
app.post('/:id/edit', auth.currentUserCan('items_edit'), (req, res) => {
	req.controller.postEdit(req, res)
})

// Change item status handlers

app.get('/:id/return', auth.currentUserCan('items_edit'), (req, res) => {
	req.controller.getReturn(req, res)
})

app.get('/:id/broken', auth.currentUserCan('items_edit'), (req, res) => {
	req.controller.getBroken(req, res)
})

app.get('/:id/lost', auth.currentUserCan('items_edit'), (req, res) => {
	req.controller.getLost(req, res)
})

app.get('/:id/sold', auth.currentUserCan('items_edit'), (req, res) => {
	req.controller.getSold(req, res)
})

// Remove item handlers

app.get('/:id/remove', auth.currentUserCan('items_remove'), (req, res) => {
	req.controller.getRemove(req, res)
})

app.post('/:id/remove', auth.currentUserCan('items_remove'), (req, res) => {
	req.controller.postRemove(req, res)
})

module.exports = config => app
