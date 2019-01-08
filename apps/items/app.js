const express = require( 'express' );

const ItemController = require('./controller');

const Items = require('../../src/models/items.js');
const Groups = require('../../src/models/groups.js');
const Departments = require('../../src/models/departments.js');
const Courses = require('../../src/models/courses.js');
const Years = require('../../src/models/years.js');
const Printers = require('../../src/models/printers.js');
const Actions = require('../../src/models/actions.js');

const app = express();

const auth = require('../../src/js/authentication');

app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new ItemController();
  next();
});

app.get( '/', auth.isLoggedIn, (req, res) => {
  req.controller.getHome(req, res);
});

app.post('/multi', auth.isLoggedIn, (req, res) => {
  req.controller.getMulti(req, res);
});

app.post('/edit', auth.isLoggedIn, (req, res) => {
  req.controller.postEdit(req, res);
});

// Generate items
app.get('/generate', auth.isLoggedIn, (req, res) => {
  req.controller.getGenerate(req, res);
});

app.post('/generate', auth.isLoggedIn, (req, res) => {
  req.controller.postGenerate(req, res);
})

// Create item
app.get( '/create', auth.isLoggedIn, (req, res) => {
  req.controller.getCreate(req, res);
});

app.post( '/create', auth.isLoggedIn, (req, res) => {
  req.controller.postCreate(req, res);
});

// List an item
app.get( '/:id', auth.isLoggedIn, (req, res) => {
  req.controller.getItem(req, res);
});

// Reprint an item
app.get( '/:id/label', auth.isLoggedIn, (req, res) => {
  req.controller.getLabel(req, res);
});

// Edit item form
app.get( '/:id/edit', auth.isLoggedIn, (req, res) => {
  req.controller.getEdit(req, res);
});

// Edit item handler
app.post( '/:id/edit', auth.isLoggedIn, (req, res) => {
  req.controller.postEdit(req, res);
});

app.get('/:id/remove', auth.isLoggedIn, (req, res) => {
  req.controller.getRemove(req, res);
});

app.post( '/:id/remove', auth.isLoggedIn, (req, res) => {
  req.controller.postRemove(req, res);
});

module.exports = function( config ) { return app; };
