var mongoose = require( 'mongoose' )
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var courseSchema = Schema( {
	_id: ObjectId,
	name: {
		type: String,
		required: true
	}
} );

var Courses = mongoose.model( 'Courses', courseSchema );

module.exports = Courses;
module.exports.schema = courseSchema;