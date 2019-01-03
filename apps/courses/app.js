const express = require( 'express' );

const auth = require('../../src/js/authentication.js');
const config = require('./config.json');
const CoursesController = require('./controller.js');

const app = express();
const controller = new CoursesController(['/', config.path].join(''));

app.set( 'views', __dirname + '/views' );
app.get( '/', auth.isLoggedIn, function ( req, res ) {
  controller.getHome(req, res);
});

app.get( '/create', auth.isLoggedIn, function ( req, res ) {
  controller.getCreate(req, res);
});

app.post( '/create', auth.isLoggedIn, function( req, res ) {
  controller.postCreate(req, res);
});

app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
  controller.getEdit(req, res);
});

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
  controller.postEdit(req, res);
});

app.get( '/:id/remove', auth.isLoggedIn, function( req, res ) {
  controller.getRemove(req, res);
});

app.post( '/:id/remove', auth.isLoggedIn, function( req, res ) {
  controller.postRemove(req, res);
});

module.exports = function( config ) { return app; };
