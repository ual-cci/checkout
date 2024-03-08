require('dotenv-safe').config({allowEmptyValues: true});

const moment = require('moment');

const BaseController = require('./src/js/common/BaseController.js');

const Items = require('./src/models/items.js');
const Users = require('./src/models/users.js');

const model = {
	items: new Items(),
	users: new Users()
};

let itemOverDueTrigger = moment().startOf('day').subtract('7', 'days');
let emailRepeatTrigger = moment().startOf('day').subtract('14', 'days');
let blockTrigger = moment().startOf('day').subtract('28', 'days');

getUsersToEmail()
.then((usersToEmail) => {
	usersToEmail.forEach(e => {

		console.log(`TO: ${e.user.name} <${e.user.email}>`)
		console.log(`FROM: UAL Creative Computing Institute <checkout@arts.ac.uk>`)
		console.log(`SUBJECT: Please Return Your Overdue Items`)
		console.log(`BLOCK: ${e.block?'Yes':'No'}`)
		console.log(`MESSAGE:\n`)
		console.log(`Hello ${e.user.name},\n\nYou have the following items which are overdue:`)

		e.items.forEach(i => {
			console.log(` - ${i.name} [${i.barcode}]`)
		})
		console.log(`\nPlease arrange to return these items within a week.\n\nKind Regards\n\nUAL Creative Computing Institute\n\n---`)
	})
})


function getUsersToEmail() {
	return new Promise((resolve, reject) => {
		model.items.query()
			.expose()
			.where('status', 'on-loan')
			.where('loanable', true)
			.where('due', '<=', itemOverDueTrigger)
			.orderBy(['barcode'])
			.then((items) => {
				let ownerItems = {};
				let userIds = []

				items.map((i) => {
					userIds.push(i.owner_id)

					if (! ownerItems[i.owner_id]) ownerItems[i.owner_id] = []
					ownerItems[i.owner_id].push({
						name: i.name,
						barcode: i.barcode
					})
				})

				return {userIds, ownerItems}
			})
			.then(({userIds, ownerItems}) => {
				model.users.query()
					.expose()
					.whereIn(`users.id`, userIds)
					.then((users) => {
						let usersToEmail = []
						users.forEach((u) => {
							if (!u.last_emailed
								|| moment(u.last_emailed).isBefore(emailRepeatTrigger)) {
								usersToEmail.push({
									user: {
										name: u.name,
										email: u.email,
										barcode: u.barcode
									},
									items: ownerItems[u.id],
									block: moment(u.last_emailed).isBefore(blockTrigger)
								})
							}
						})

						resolve(usersToEmail)
					});
			})
			.catch((e) => {
				reject(e)
			})
	})
}

