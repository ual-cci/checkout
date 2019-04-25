const express = require( 'express' );

const PrintersController = require('./controller');
const auth = require('../../src/js/authentication');

const app = express();

app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new PrintersController();
  next();
});

// View
app.get('/', auth.isLoggedIn, (req, res) => {
  req.controller.getRoot(req, res);
});

// Create
app.get('/create', auth.isLoggedIn, (req, res) => {
  req.controller.getCreate(req, res);
});

app.post( '/create', auth.isLoggedIn, (req, res) => {
  req.controller.postCreate(req, res);
});

// Edit
app.get('/:id/edit', auth.isLoggedIn, (req, res) => {
  req.controller.getEdit(req, res);
});

app.post('/:id/edit', auth.isLoggedIn, (req, res) => {
  req.controller.postEdit(req, res);
});

// Remove
app.get( '/:id/remove', auth.isLoggedIn, (req, res) => {
  req.controller.getRemove(req, res);
});

app.post( '/:id/remove', auth.isLoggedIn, (req, res) => {
  req.controller.postRemove(req, res);
});

module.exports = config => app;
