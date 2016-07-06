var mongoose = require( 'mongoose' ),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var groupsSchema = Schema( {
	_id: ObjectId,
	name: {
		type: String,
		required: true
	},
	limiter: {
		type: Number
	}
} );

var Groups = mongoose.model( 'Groups', groupsSchema );

module.exports = Groups;
module.exports.schema = groupsSchema;
