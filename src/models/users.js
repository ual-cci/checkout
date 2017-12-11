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
		password: {
			salt: String,
			hash: String,
			iterations: Number
		},
		course: {
			type: ObjectId,
			ref: 'Courses'
		},
		year: {
			type: ObjectId,
			ref: 'Years'
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
