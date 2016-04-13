// secur database access functions
//
var neo4j = require('neo4j');
var config = require('./../config/config.js');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    config.dbURL
);

exports.isAdmin = function(id, callback){
    
    var query = [
        'MATCH (a)-[:ADMINS]->()',
        'WHERE ID(a)='+id,
        'RETURN ID(a)'].join('\n');
    
    try{
		db.cypher({query:query, params:null}, function(err, results) {
			if(err)
				return callback(err);
			if(results.length>0)
				return callback(null,true);
			else
				return callback(null,false);
		});
	}catch(err){
		return callback(err);
	}
};

exports.verifyPassword = function (id,callback){
    
    var query = [
        'MATCH (u)',
        'WHERE ID(u)=' + id.toString(),
        'RETURN u.password AS pass, u.salt AS salt'
    ].join('\n');
    
    try{
		db.cypher({query:query, params:null}, function (err, results) {
			if(err){
				return callback(err);
			}
			return callback(null, results[0]);
		});
	}catch(err){
		return callback(err);
	}
};

