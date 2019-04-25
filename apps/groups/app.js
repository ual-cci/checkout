const	express = require('express');

const GroupController = require('./controller.js');
const auth = require('../../src/js/authentication.js');

const app = express();

app.set( 'views', __dirname + '/views');

app.use((req, res, next) => {
  req.controller = new GroupController();
  next();
});

app.get('/', auth.isLoggedIn, function(req, res) {
  req.controller.getRoot(req, res);
});

app.get('/create', auth.isLoggedIn, function(req, res) {
  req.controller.getCreate(req, res);
});

app.post('/create', auth.isLoggedIn, function(req, res) {
  req.controller.postCreate(req, res);
});

app.get('/:id/edit', auth.isLoggedIn, function(req, res) {
  req.controller.getEdit(req, res);
})

app.post('/:id/edit', auth.isLoggedIn, function(req, res) {
  req.controller.postEdit(req, res);
});

app.get('/:id/remove', auth.isLoggedIn, function(req, res) {
  req.controller.getRemove(req, res);
});

app.post('/:id/remove', auth.isLoggedIn, function(req, res) {
  req.controller.postRemove(req, res);
});

module.exports = config => app;
