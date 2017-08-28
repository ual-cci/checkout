var mongoose = require( 'mongoose' ),
	ObjectId = mongoose.Schema.ObjectId;

module.exports = {
	name: 'Groups',
	schema: mongoose.Schema( {
		_id: ObjectId,
		name: {
			type: String,
			required: true
		},
		limiter: {
			type: Number
		}
	} )
};

module.exports.model = mongoose.model( module.exports.name, module.exports.schema );
