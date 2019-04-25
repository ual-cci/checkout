const express = require( 'express' );

const auth = require('../../src/js/authentication.js');
const CoursesController = require('./controller.js');

const app = express();

app.use((req, res, next) => {
  req.controller = new CoursesController();
  next();
});

app.set( 'views', __dirname + '/views' );
app.get( '/', auth.isLoggedIn, (req, res ) => {
  req.controller.getRoot(req, res);
});

app.get( '/create', auth.isLoggedIn, (req, res ) => {
  req.controller.getCreate(req, res);
});

app.post( '/create', auth.isLoggedIn, (req, res) => {
  req.controller.postCreate(req, res);
});

app.get( '/:id/edit', auth.isLoggedIn, (req, res) => {
  req.controller.getEdit(req, res);
});

app.post( '/:id/edit', auth.isLoggedIn, (req, res) => {
  req.controller.postEdit(req, res);
});

app.get( '/:id/remove', auth.isLoggedIn, (req, res) => {
  req.controller.getRemove(req, res);
});

app.post( '/:id/remove', auth.isLoggedIn, (req, res) => {
  req.controller.postRemove(req, res);
});

module.exports = config => app;
