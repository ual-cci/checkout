const {Queue: BullMQ} = require('bullmq')

const Queue = {
	MQ: null,
	queues: {
		labels: null
	},

	_firstRun: (cb) => {
		Queue.MQ = (name) => new BullMQ(name, {
			connection: {
				port: process.env.REDIS_PORT,
				host: process.env.REDIS_HOST,
				password: process.env.REDIS_PASSWORD,
				tls: process.env.REDIS_TLS == 'true' ? true : false,
			}
		})
		Queue.queues.labels = Queue.MQ('Labels')
	},

	task: (queue, task) => {
		let title = 'Task'
		if (queue == 'Labels') title = 'Print Label'
		if (task.user) title += ` – ${task.user}`
		Queue.queues.labels.add(title, task)
	},
}


module.exports = () => {
	if (global.CheckoutQueue === undefined) {
		Queue._firstRun();
		global.CheckoutQueue = Queue
	}
	return global.CheckoutQueue;
}
