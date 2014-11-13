////////////////////////////////////////////////////////////////
//                                                            //
// Módulo del server que se comunica la base de datos MongoDB //
//                                                            //
////////////////////////////////////////////////////////////////

var mongo = require('mongodb').MongoClient;

/** @type {String} URL de conexión a la base de datos MongoDB */
var mdburl = 'mongodb://localhost:27017/test';
/** @type {MongoDB} Objeto que hace referencia a la base de datos utilizada */
var db = null;

/**
 * Realiza la conexión con la base de datos MongoDB local y guarda la referencia
 * en db
 * 
 * @param  {String} mdburl URL de conexión
 * @param  {Function} callback Callback al que le llega la referencia a la base de
 * datos y el error en el caso correspondiente
 */
mongo.connect(mdburl, function(err, mdb) {
	if(err){
		console.log('Error connecting to mongodb server');
	} else {
		console.log('Connected correctly to mongodb server');
		db = mdb;
	}
});

/**
 * Realiza una búsqueda de las categorías posibles en la BDD, aplicando un filtro.
 * Por ejemplo, sólo las categorías clasificadas como 'Person', o 'Activity'
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 */
exports.getTypes = function (req, res, next) {

	var sub = req.query.sub;
	var col = db.collection('Types');
	var filter = new RegExp(sub+'.*');
	console.log(filter);
	// Sólo interesa el nombre, no el tipo de nodo
	col.find({type:filter}, {_id:0,type:0}).toArray(function(err, docs) {
		if (err){
			res.send(500,'Error MONGO getTypes');
			return;
		} else {
			res.send(200, {data:docs});
			return;
		}
  });
};

/**
 * Realiza una búsqueda de las subcategorías de una categoría. Por ejemplo, los
 * nombres de un profesor o alumno, o las diferentes materias
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 */
exports.getSubTypes = function (req, res, next) {

	var col = db.collection(req.query.type);

	// Se devuelve el ID y el nombre para hacer el match luego con las Actividades
	col.find({}).toArray(function(err, docs) {
		if (err){
				res.send(500,'Error MONGO getSubTypes');
				return;
		} else {
			console.log(docs);
			res.send(200, {data:docs});
			return;
		}
  	});
};

/**
 * Realiza una búsqueda de los horarios para la semana, y el elemento indicado
 * (ya sea una persona o una materia por ejemplo).
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 *
 * TODO: Buscar por ID!
 */
exports.getTimes = function(req, res, next){

	var col = db.collection('Actividades');
	var name = req.query.name;
	var week = parseInt(req.query.week);
	
	col.find({$and: [	{$or: [{what: name}, {who: name}, {where: name}]}, 
						{"when.week":week},
						{"when.year":(new Date()).getFullYear()}] },
						{_id:0}).toArray(function(err, docs) {
		if (err){
				res.send(500,'Error MONGO getTimes');
				return;
		} else {
			console.log(docs);
			res.send(200, {data:docs});
			return;
		}
  	});
};

/**
 * Realiza la búsqueda de la configuración de las franjas horarias. Límites por
 * un lado y colores según se pida, para un tipo de actividad indicada.
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 */
exports.getConfig = function(req, res, next){

	var col = db.collection('Config');
	var act = req.query.act;
	var filter;
	if(act){
		filter = new RegExp(act+'.*');
	} else {
		filter = new RegExp('.*');
	}
	console.log(filter);
	var types;
	var limits;
	col.find({name: 'limits'}).toArray(function(err,lim) {
		if(err) {
			res.send(500,'Error MONGO getConfig 1');
			return;
		} else {
			limits = lim[0];
			col.find({name: {$not: /limits/}, Activity: filter}).toArray(function(err,docs) {
				if(err) {
					res.send(500,'Error MONGO getConfig 2');
					return;
				} else {
					types = docs;
					console.log(docs);
					res.send(200, {limits:limits, types:docs});
				}
			});
		}
	});
};

/**
 * Realiza una búsqueda de los lugares posibles para desarrollarse las
 * actividades.
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 */
exports.getPlaces = function (req, res, next) {

	var col = db.collection('Places');

	col.find({},{_id:0}).toArray(function(err, docs) {
		if (err){
			res.send(500,'Error MONGO getPlaces');
			return;
		} else {
			res.send(200, {data:docs});
			return;
		}
  });
};
