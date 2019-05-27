require('dotenv').config()

const express = require('express')
const http = require('http')
const flash = require('express-flash')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const {auth} = require('./src/js/authentication.js')
const sessions = require('./src/js/sessions.js')
const appLoader = require('./src/js/app-loader.js')

const app = express()
const server = http.Server(app)

app.use(helmet())
auth(app)
app.use(express.static('./static'))
sessions(app)
app.use(flash())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Use PUG to render pages
app.set('views', './src/views')
app.set('view engine', 'pug')
app.set('view cache', false)

// Load apps
appLoader(app)

// Start server
const listener = server.listen(process.env.APP_PORT ,process.env.APP_HOST, function () {
  console.log('Server started')
})
