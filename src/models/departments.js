var mongoose = require( 'mongoose' ),
	ObjectId = mongoose.Schema.ObjectId;

module.exports = {
	name: 'Departments',
	schema: mongoose.Schema( {
		_id: ObjectId,
		name: {
			type: String,
			required: true
		}
	} )
};

module.exports.model = mongoose.model( module.exports.name, module.exports.schema );
