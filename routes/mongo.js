var mongo = require('mongodb').MongoClient;

var mdburl = 'mongodb://localhost:27017/test';
var db = null;

mongo.connect(mdburl, function(err, mdb) {
	if(err){
		console.log('Error connecting to mongodb server');
	} else {
		console.log('Connected correctly to mongodb server');
		db = mdb;
	}
});

exports.getTypes = function (req, res, next) {

	var col = db.collection('types');

	col.find().toArray(function(err, docs) {
		if (err){
				res.send(500,'Error MONGO');
				return;
		}
		console.log(docs);
		res.send(200, {data:docs});
		return;
  });
};

exports.getSubTypes = function (req, res, next) {

	var col = db.collection(req.query.name);

	col.find().toArray(function(err, docs) {
		if (err){
				res.send(500,'Error MONGO');
				return;
		}
		console.log(docs);
		res.send(200, {data:docs});
		return;
  });
	return;
};
