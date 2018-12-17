var __root = __dirname + '/../..',
	__src = __root + '/src',
	__js = __src + '/js',
	__models = __src + '/models';

var fs = require( 'fs' );
var knex = require( 'knex' );

var log = require( __js + '/logging' ).log;

var db = {
	pg: null,
	load_modules: function() {
		var files = fs.readdirSync( __models );

		log.info( {
			app: 'database',
			action: 'loading-models',
			message: 'Loading models',
		} );

		for ( var f = 0; f < files.length; f++ ) {
			var model = require( __models + '/' + files[f] )( db.pg );
			log.debug( {
				app: 'database',
				action: 'load-model',
				model: model.name
			} );
			db[ model.name ] = model;
		}
	}
};

module.exports = function( conf ) {
	if ( global['knex_db'] == undefined ) {
		log.debug( {
			app: 'database',
			action: 'connect',
			message: 'Connected to database'
		} );
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
