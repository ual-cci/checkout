var __home = __dirname + '/../..';
var __config = __home + '/config/config.json';
var __src = __home + '/src';

var config = require( __config );

var mongoose = require( 'mongoose' ),
	ObjectId = mongoose.Schema.ObjectId;

exports.connect = function() {
	mongoose.connect( config.mongo );
	var db = mongoose.connection;
	db.on( 'connected', console.error.bind( console, 'Connected to Mongo database.' ) );
	db.on( 'error', console.error.bind( console, 'Error connecting to Mongo database.' ) );

	return exports;
}

var itemSchema = mongoose.Schema( {
	_id: ObjectId,
	name: {
		type: String,
		required: true
	},
	barcode:  {
		type: String,
		unique: true,
		required: true
	},
	department: {
		type: ObjectId,
		ref: 'Departments'
	},
	group: {
		type: ObjectId,
		ref: 'Groups'
	},
	notes: {
		type: String
	},
	value: {
		type: Number
	},
	transactions: [ {
		date: {
			type: Date,
			default: Date.now,
			required: true
		},
		user: {
			type: ObjectId,
			ref: 'Users',
			required: true
		},
		status: {
			type: String,
			enum: [ 'returned', 'loaned', 'reserved', 'broken', 'audited' ],
			required: true
		}
	} ]
} );

itemSchema.virtual( 'status' ).get( function() {
	if ( this.transactions.length == 0 ) return 'new';
	var last_transaction = this.transactions[ this.transactions.length - 1 ];

	if ( last_transaction.status == 'audited' ) {
		for ( i = this.transactions.length - 1; i >= 0; i-- ) {
			if ( this.transactions[ i ].status != 'audited' ) {
				last_transaction = this.transactions[ i ];
				break;
			}
		}
	}

	switch ( last_transaction.status ) {
		case 'returned':
			return 'available';
		case 'loaned':
			return 'on-loan';
		case 'reserved':
			return 'reserved';
		case 'broken':
			return 'broken';
		case 'audited':
			return 'available';
		default:
			return last_transaction.status;
	}
	return 'available';
} );

itemSchema.virtual( 'audited' ).get( function() {
	if ( this.transactions.length == 0 ) return false;
	var today = new Date().setHours( 0, 0, 0, 0 );

	for ( i = 0; i < this.transactions.length; i++ ) {
		if ( this.transactions[ i ].status == 'audited' &&
			this.transactions[ i ].date >= today ) {
			return true;
		}
	}

	return false;
} );

var groupsSchema = mongoose.Schema( {
	_id: ObjectId,
	name: {
		type: String,
		required: true
	},
	limiter: {
		type: Number
	}
} );

var userSchema = mongoose.Schema( {
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
} );

var departmentSchema = mongoose.Schema( {
	_id: ObjectId,
	name: {
		type: String,
		required: true
	}
} );

var courseSchema = mongoose.Schema( {
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

exports.ObjectId = ObjectId;
exports.mongoose = mongoose;

var Items = mongoose.model( 'Items', itemSchema );
exports.Items = Items;
exports.itemSchema = itemSchema;

var Groups = mongoose.model( 'Groups', groupsSchema );
exports.Groups = Groups;
exports.groupsSchema = groupsSchema;

var Users = mongoose.model( 'Users', userSchema );
exports.Users = Users;
exports.userSchema = userSchema;

var Departments = mongoose.model( 'Departments', departmentSchema );
exports.Departments = Departments;
exports.departmentSchema = departmentSchema;

var Courses = mongoose.model( 'Courses', courseSchema );
exports.Courses = Courses;
exports.courseSchema = courseSchema;
