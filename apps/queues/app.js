const express = require('express')
const auth = require('../../src/js/authentication')
const app = express()

const {createBullBoard} = require('@bull-board/api')
const {BullMQAdapter} = require('@bull-board/api/bullMQAdapter')
const {ExpressAdapter} = require('@bull-board/express')
const {Queue: QueueMQ} = require('bullmq')

const createQueueMQ = (name) => new QueueMQ(name, {connection: {
	port: process.env.REDIS_PORT,
	host: process.env.REDIS_HOST,
	password: process.env.REDIS_PASSWORD,
	tls: process.env.REDIS_TLS == 'true' ? true : false,
}})
const labelsQueue = createQueueMQ('Labels');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');

createBullBoard({
	queues: [new BullMQAdapter(labelsQueue)],
	serverAdapter,
	options: {
		uiConfig: {
			boardTitle: 'Checkout',
			boardLogo: {
				path: '/imgs/logo.svg',
				width: '30px'
			},
			miscLinks: [
				{text: 'Back to Checkout', url: '/'},
				{text: 'Logout of Checkout', url: '/logout'}
			],
			favIcon: {
				default: '/favicon-32x32.png',
				alternative: '/favicon.ico',
			},
		},
	}
})

app.use('/', auth.currentUserCan('view_queues'), serverAdapter.getRouter())

module.exports = config => app
