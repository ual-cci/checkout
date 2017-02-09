var mongoose = require( 'mongoose' )
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Users = require( __dirname + '/users' ),
	userSchema = Users.schema;


var courseSchema = Schema( {
	_id: ObjectId,
	name: {
		type: String,
		required: true
	},
	contact: {
		type: ObjectId,
		ref: 'Users'
	}
} );

var Courses = mongoose.model( 'Courses', courseSchema );

module.exports = Courses;
module.exports.schema = courseSchema;
