var mongoose = require( 'mongoose' ),
	ObjectId = mongoose.Schema.ObjectId;

module.exports = {
	name: 'Items',
	schema: mongoose.Schema( {
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
				enum: [ 'returned', 'loaned', 'reserved', 'broken', 'audited', 'lost' ],
				required: true
			}
		} ]
	} )
};

module.exports.schema.virtual( 'status' ).get( function() {
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

module.exports.schema.virtual( 'audited' ).get( function() {
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

module.exports.model = mongoose.model( module.exports.name, module.exports.schema );
