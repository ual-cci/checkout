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
sessions(app)
auth(app)
app.use(flash())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static('./static'))
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))
app.use('/buzz', express.static('./node_modules/buzz/dist'))
app.use('/clipboard', express.static('./node_modules/clipboard/dist'))
app.use('/jquery', express.static('./node_modules/jquery/dist'))
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'))

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
