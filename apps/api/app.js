const express = require('express')

const app = express()

const ApiController = require('./controller')
const auth = require('../../src/js/authentication')

app.set('views', __dirname + '/views')

app.use((req, res, next) => {
	req.controller = new ApiController()
	next()
})

app.get('/search/:term', auth.APIuserCan('global_search'), (req, res) => {
	req.controller.getSearch(req, res)
})

app.get('/find/:term', auth.APIuserCan('checkout_issue'), (req, res) => {
	req.controller.getFind(req, res)
})

app.get('/identify/:term', auth.APIuserCan('checkout_issue'), (req, res) => {
	req.controller.getIdentify(req, res)
})

app.get('/user/:barcode', auth.APIuserCan('checkout_issue'), (req, res) => {
	req.controller.getUser(req, res)
})

app.get('/item/:barcode', auth.APIuserCan('checkout_issue'), (req, res) => {
	req.controller.getItem(req, res)
})

app.post('/audit/:item', auth.APIuserCan('checkout_audit'), (req, res) => {
	req.controller.postAudit(req, res)
})

app.post('/return/:item', auth.APIuserCan('items_return'), (req, res) => {
	req.controller.postReturn(req, res)
})

app.post('/broken/:item', auth.APIuserCan('items_broken'), (req, res) => {
	req.controller.postBroken(req, res)
})

app.post('/lost/:item', auth.APIuserCan('items_lost'), (req, res) => {
	req.controller.postLost(req, res)
})

app.post('/sold/:item', auth.APIuserCan('items_sold'), (req, res) => {
	req.controller.postSold(req, res)
})

app.post('/issue/:item/:user', auth.APIuserCan('checkout_issue'), (req, res) => {
	req.controller.postIssue(req, res)
})

app.post('/label/:item', auth.APIuserCan('print'), (req, res) => {
	req.controller.postLabel(req, res)
})

app.get('/select-printer/:id', auth.APIuserCan('print'), (req, res) => {
	req.controller.getSelectLabel(req, res)
})

app.post('/new-user', auth.APIuserCan('users_create'), (req, res) => {
	req.controller.postNewUser(req, res)
})

app.get('/history', auth.APIuserCan('checkout_history'), (req, res) => {
	req.controller.getHistory(req, res)
})

module.exports = config => app
