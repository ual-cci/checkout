
exports.seed = function(knex) {
	// Deletes ALL existing entries
	return knex('years').del()
		.then(function () {
			return knex('years').insert([
				{name: 'Year Zero'},
				{name: 'Year One'},
				{name: 'Year Two'},
				{name: 'Year Three'},
				{name: 'Graduate'},
				{name: 'N/A'},
			])
	})
}
