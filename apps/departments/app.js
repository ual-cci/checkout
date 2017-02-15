var __home = __dirname + "/../..";
var __src = __home + '/src';
var __js = __src + '/js';

var	express = require( 'express' ),
	app = express();

var db = require( __js + '/database' ),
	Items = db.Items,
	Departments = db.Departments;

var auth = require( __js + '/authentication' );

app.set( 'views', __dirname + '/views' );

app.get( '/', auth.isLoggedIn, function ( req, res ) {
	Departments.find( function( err, departments ) {
		res.render( 'departments', { departments: departments } );
	} )
} );

// Create
app.get( '/create', auth.isLoggedIn, function ( req, res ) {
	res.render( 'create', { department: {} } );
} )

app.post( '/create', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The department requires a name' );
		res.redirect( app.mountpath + '/create' );
	}

	new Departments( {
		_id: require( 'mongoose' ).Types.ObjectId(),
		name: req.body.name,
	} ).save( function ( err ) {
		req.flash( 'success', 'Department created' );
		res.redirect( app.mountpath );
	} );
} )

// View
app.get( '/:id', auth.isLoggedIn, function( req, res ) {
	Departments.findOne( { _id: req.params.id }, function( err, department ) {
		if ( department == undefined ) {
			req.flash( 'danger', 'Department not found' );
			res.redirect( app.mountpath );
		} else {
			Items.find( { department: req.params.id } ).populate( 'group' ).exec( function( err, items ) {
				res.render( 'department', { department: department, items: items } );
			} );
		}
	} )
} )

// Edit
app.get( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	Departments.findOne( { _id: req.params.id }, function( err, department ) {
		if ( department == undefined ) {
			req.flash( 'danger', 'Department not found' );
			res.redirect( app.mountpath );
		} else {
			res.render( 'edit', { department: department } );
		}
	} )
} )

app.post( '/:id/edit', auth.isLoggedIn, function( req, res ) {
	if ( req.body.name == '' ) {
		req.flash( 'danger', 'The department requires a name' );
		res.redirect( app.mountpath + '/edit' );
	}

	Departments.update( { _id: req.params.id }, {
		$set: {
			name: req.body.name,
		}
	} ).then( function ( status ) {
		if ( status.nModified == 1 && status.n == 1 ) {
			req.flash( 'success', 'Department updated' );
		} else if ( status.nModified == 0 && status.n == 1 ) {
			req.flash( 'warning', 'Department was not changed' );
		} else {
			req.flash( 'danger', 'There was an error updating the department' );
		}
		res.redirect( app.mountpath + '/' + req.params.id );
	}, function ( status ) {
		req.flash( 'danger', 'There was an error updating the department' );
		res.redirect( app.mountpath + '/' + req.params.id );
	}  );
} )

module.exports = function( config ) { return app; };
