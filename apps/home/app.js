const express = require( 'express' );
const auth = require('../../src/js/authentication.js');

const app = express();

app.get('/', auth.isLoggedIn, (req, res) => {
	res.redirect('/checkout');
});

module.exports = config => app;
