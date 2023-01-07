require('dotenv-safe').config({allowEmptyValues: true});

const express = require('express')
const http = require('http')
const flash = require('express-flash-plus')
const helmet = require('helmet')

const {auth} = require('./src/js/authentication.js')
const sessions = require('./src/js/sessions.js')
const appLoader = require('./src/js/app-loader.js')
const templateLocals = require('./src/js/template-locals.js')
const errors = require('./src/js/errors.js')

const app = express()
const server = http.Server(app)

app.use(helmet())
sessions(app)
auth(app)
app.use(flash())

app.use(express.static('./static'))
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))
app.use('/buzz', express.static('./node_modules/buzz/dist'))
app.use('/clipboard', express.static('./node_modules/clipboard/dist'))
app.use('/jquery', express.static('./node_modules/jquery/dist'))
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'))
app.use('/moment', express.static('./node_modules/moment/min'))
app.use('/tempusdominus', express.static('./node_modules/tempusdominus-bootstrap-4/build'))

// Use PUG to render pages
app.set('views', './src/views')
app.set('view engine', 'pug')
app.set('view cache', false)

// Load apps
app.use(templateLocals())
appLoader(app)


errors(app)

// Start server
const listener = server.listen(process.env.APP_PORT ,process.env.APP_HOST, function () {
	console.log('Server started')
})
