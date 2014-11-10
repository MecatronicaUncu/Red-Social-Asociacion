var mongo = require('mongodb').MongoClient;

var mdburl = 'mongodb://localhost:27017/test';
var db = null;
var mongoConfig;

mongo.connect(mdburl, function(err, mdb) {
	if(err){
		console.log('Error connecting to mongodb server');
	} else {
		console.log('Connected correctly to mongodb server');
		db = mdb;
		mongoConfig = db.collection('Config').find({name:'type'});
	}
});

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
