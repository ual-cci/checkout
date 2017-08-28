var mongoose = require( 'mongoose' ),
	ObjectId = mongoose.Schema.ObjectId;

module.exports = {
	name: 'Courses',
	schema: mongoose.Schema( {
		_id: ObjectId,
		name: {
			type: String,
			required: true
		},
		contact: {
			type: ObjectId,
			ref: 'Users'
		}
	} )
};

module.exports.model = mongoose.model( module.exports.name, module.exports.schema );
