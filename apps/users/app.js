const express = require('express');

const UsersController = require('./controller');
const auth = require('../../src/js/authentication');

const app = express();

app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new UsersController();
  next();
});

// List view
app.get('/', auth.currentUserCan('users_read'), (req, res) => {
  req.controller.getRoot(req, res);
});

// Edit multiple
app.post('/edit', auth.currentUserCan('users_multi_edit'), (req, res) => {
  req.controller.postEdit(req, res);
});

// View user
app.get('/:id', auth.currentUserCan('users_read'), (req, res) => {
  req.controller.getUser(req, res);
});

// Edit user
app.get('/:id/edit', auth.currentUserCan('users_edit'), (req, res) => {
  req.controller.getUserEdit(req, res);
});

app.post( '/:id/edit', auth.currentUserCan('users_edit'), (req, res) => {
  req.controller.postUserEdit(req, res);
});

app.get( '/:id/remove', auth.currentUserCan('users_remove'), (req, res) => {
  req.controller.getUserRemove(req, res);
});

app.post( '/:id/remove', auth.currentUserCan('users_remove'), (req, res) => {
  req.controller.postUserRemove(req, res);
});

app.get( '/:id/reset', auth.currentUserCan('users_reset_password_attempts'), (req, res) => {
  req.controller.getReset(req, res);
});

module.exports = config => app;
