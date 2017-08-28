var mongoose = require( 'mongoose' ),
	ObjectId = mongoose.Schema.ObjectId;

module.exports = {
	name: 'Users',
	schema: mongoose.Schema( {
		_id: ObjectId,
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		course: {
			type: ObjectId,
			ref: 'Courses'
		},
		barcode: {
			type: String,
			unique: true,
			required: true
		},
		type: {
			type: String,
			enum: [ 'student', 'staff' ],
			default: 'student',
			required: true
		},
		read_tc: {
			type: Boolean,
			default: false
		},
		printer: {
			type: ObjectId,
			ref: 'Printers'
		},
		disable: {
			type: Boolean,
			default: false
		},
		audit_point: {
			type: Date
		}
	} )
};

module.exports.model = mongoose.model( module.exports.name, module.exports.schema );
