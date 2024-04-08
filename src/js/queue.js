const Options = require('./options')()

const Queue = {

	_firstRun: () => {
		// Connect to redis
	},

	_task: (queue, task) => {
		console.log(`${queue}: `, task)
		// Queue the task
	},

	task: (queue, task) => {
		// Split multiple tasks into seperate ones
		if (Array.isArray(task)) {
			task.forEach(i => {
				Queue._task(queue, i)
			})
		} else {
			Queue._task(queue, task)
		}
	},
}


module.exports = () => {
	if (global.CheckoutQueue === undefined) {
		Queue._firstRun();
		global.CheckoutQueue = Queue
	}
	return global.CheckoutQueue;
}
