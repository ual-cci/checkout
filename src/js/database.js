var __root = __dirname + '/../..',
	__src = __root + '/src',
	__models = __src + '/models';

var fs = require( 'fs' );
var knex = require( 'knex' );

var db = {
	pg: null,
	load_modules: function() {
		console.log( 'Loading PostgreSQL models:' );

		var files = fs.readdirSync( __models );
		for ( var f = 0; f < files.length; f++ ) {
			var model = require( __models + '/' + files[f] )( db.pg );
			console.log( '	' + model.name );
			db[ model.name ] = model;
		}

		console.log();
	}
};

module.exports = function( conf ) {
	if ( global['knex_db'] == undefined ) {
		console.log( 'Connecting to database...' );
		console.log();
		db.pg = knex( {
			client: 'pg',
			connection: conf
		} );

		db.load_modules();

		global['knex_db'] = db.pg;
	} else {
		db.pg = global['knex_db'];
	}

	return db;
};
