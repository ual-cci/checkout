var	express = require( 'express' ),
	app = express(),
	Departments = require( __dirname + '/../models/departments' ),
	Items = require( __dirname + '/../models/items' );

var prefix = 'departments';

// Handle redirect
app.use( function( req, res, next ) {
	res.locals.currentModule = 'items';
	if ( ! req.isAuthenticated() ) {
		req.session.requested = req.originalUrl;
		req.add_flash( 'danger', 'Please login' );
		res.redirect( '/login' );
	} else {
		next();
	}
} );

// Index
app.get( '/', function ( req, res ) {
	Departments.find( function( err, departments ) {
		res.render( prefix + '/departments', { departments: departments } );
	} )
} )

// Create
app.get( '/create', function ( req, res ) {
	res.render( prefix + '/create', { department: { name: '' } } );
} )

app.post( '/create', function( req, res ) {
	if ( req.body.name == '' ) {
		req.add_flash( 'danger', 'The department requires a name' );
		res.redirect( '/' + prefix + '/create' );
	}

	new Departments( {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
	} ).save( function ( err ) {
		req.add_flash( 'success', 'Department created' );
		res.redirect( '/' + prefix );
	} );
} )

// View
app.get( '/:id', function( req, res ) {
	Departments.findOne( { _id: req.params.id }, function( err, department ) {
		if ( department == undefined ) {
			req.add_flash( 'danger', 'Department not found' );
			res.redirect( '/' + prefix );
		} else {
			Items.find( { department: req.params.id } ).populate( 'group' ).exec( function( err, items ) {
				res.render( prefix + '/department', { department: department, items: items } );
			} );
		}
	} )
} )

// Edit
app.get( '/:id/edit', function( req, res ) {
	Departments.findOne( { _id: req.params.id }, function( err, department ) {
		if ( department == undefined ) {
			req.add_flash( 'danger', 'Department not found' );
			res.redirect( '/' + prefix );
		} else {
			res.render( prefix + '/edit', { department: department } );
		}
	} )
} )

app.post( '/:id/edit', function( req, res ) {
	if ( req.body.name == '' ) {
		req.add_flash( 'danger', 'The department requires a name' );
		res.redirect( '/' + prefix + '/edit' );
	}

	Departments.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
		}
	} ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.add_flash( 'success', 'Department updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.add_flash( 'warning', 'Department was not changed' );
		} else {
			console.log( status );
			req.add_flash( 'danger', 'There was an error updating the department' );
		}
		res.redirect( '/' + prefix + '/' + req.params.id );
	}, function ( status ) {
		console.log( status );
		req.add_flash( 'danger', 'There was an error updating the department' );
		res.redirect( '/' + prefix + '/' + req.params.id );
	}  );
} )

module.exports = app;
module.exports.path = '/' + prefix;
