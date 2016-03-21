var mongoose = require( 'mongoose' )
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var departmentSchema = Schema( {
	_id: ObjectId,
	name: {
		type: String,
		required: true
	}
} );

var Departments = mongoose.model( 'Departments', departmentSchema );

module.exports = Departments;
module.exports.schema = departmentSchema;