const express = require( 'express' );

const ItemController = require('./controller');
const auth = require('../../src/js/authentication');

const app = express();

app.set( 'views', __dirname + '/views' );

app.use((req, res, next) => {
  req.controller = new ItemController();
  next();
});

app.get( '/', auth.currentUserCan('items_read'), (req, res) => {
  req.controller.getRoot(req, res);
});

app.post('/multi', auth.currentUserCan('print'), (req, res) => {
  req.controller.getMulti(req, res);
});

app.post('/edit', auth.currentUserCan('items_multi_edit'), (req, res) => {
  req.controller.postMultiEdit(req, res);
});

// Generate items
app.get('/generate', auth.currentUserCan('items_generate'), (req, res) => {
  req.controller.getGenerate(req, res);
});

app.post('/generate', auth.currentUserCan('items_generate'), (req, res) => {
  req.controller.postGenerate(req, res);
})

// Import items
app.get('/import', auth.currentUserCan('items_import'), (req, res) => {
  req.controller.getImport(req, res);
});

app.post('/process', auth.currentUserCan('items_import'), (req, res) => {
  req.controller.postImportProcess(req, res);
})

app.post('/import', auth.currentUserCan('items_import'), (req, res) => {
  req.controller.postImportData(req, res);
})

// Create item
app.get( '/create', auth.currentUserCan('items_create'), (req, res) => {
  req.controller.getCreate(req, res);
});

app.post( '/create', auth.currentUserCan('items_create'), (req, res) => {
  req.controller.postCreate(req, res);
});

// List an item
app.get( '/:id', auth.currentUserCan('items_read'), (req, res) => {
  req.controller.getItem(req, res);
});

// Reprint an item
app.get( '/:id/label', auth.currentUserCan('print'), (req, res) => {
  req.controller.getLabel(req, res);
});

// Edit item form
app.get( '/:id/edit', auth.currentUserCan('items_edit'), (req, res) => {
  req.controller.getEdit(req, res);
});

// Edit item handler
app.post( '/:id/edit', auth.currentUserCan('items_edit'), (req, res) => {
  req.controller.postEdit(req, res);
});

app.get('/:id/remove', auth.currentUserCan('items_remove'), (req, res) => {
  req.controller.getRemove(req, res);
});

app.post( '/:id/remove', auth.currentUserCan('items_remove'), (req, res) => {
  req.controller.postRemove(req, res);
});

module.exports = config => app;
