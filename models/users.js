var mongoose = require( 'mongoose' )
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId,
	Courses = require( __dirname + '/courses' ),
	courseSchema = Courses.schema;

var userSchema = Schema( {
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
		enum: [ 'student', 'staff', 'admin' ],
		default: 'staff',
		required: true
	},
	read_tc: {
		type: Boolean,
		default: false
	},
} );

var Users = mongoose.model( 'Users', userSchema );

module.exports = Users;
module.exports.schema = userSchema;
