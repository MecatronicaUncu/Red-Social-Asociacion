// Admin database access functions

var neo4j = require('neo4j');
var config = require('./../config/config.js');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    config.dbURL
);

exports.getAdminNodes = function(idNEO, callback){
	
	var query = [
        'MATCH (admin)-[:ADMINS]->(nodes)',
        'WHERE ID(admin) = '+idNEO,
        'OPTIONAL MATCH (nodes)-[:PARTOF]->(parent)',
        'RETURN distinct nodes as nodeData, ID(nodes) AS idNEO,',
        'LABELS(nodes) AS label, parent.name AS parentName'
    ].join('\n');

    db.cypher({query:query, params:null}, function (err, results) {
        if (err){
			throw err;
            console.log("err get AdminNodes");
            return callback(err);
        }else if(results.length === 0){
            return callback('Unauthorized');
        }else{
            results.forEach(function(res){
                res.nodeData = res.nodeData._data.data;
                res.label = res.label[0];
            });
            return callback(null, results);
        }
     });        	
};

exports.getNodeRelTypes = function(memberof, callback){

  var query = [
    'MATCH (partrel:nodeType)',
    'WHERE NOT partrel.type="ActivityType"',
    'AND "'+memberof+'" IN partrel.parent',
    'RETURN partrel AS nodeData'
  ].join('\n');

  db.cypher({query:query, params:null}, function(err, results){
    if(err){
      throw err;
      return callback(err);
    }else{
      var parts = [];
      var rels = [];
      
      results.forEach(function(res){
        res = res.nodeData._data.data;
        if(res.type === 'User'){
          //Handle relationships
          rels.push(res);
        } else {
          //Handle parts
          parts.push(res);
        }
      });

      return callback(null,parts,rels);
    }
  });
};

exports.getNodeRelFields = function(label, callback){

  var query = [
    'MATCH (u:nodeType)',
    'WHERE u.label="'+label+'"',
    'RETURN u.fields AS fields'
  ].join('\n');

  db.cypher({query:query, params:null}, function(err, results){
    if(err){
      throw err;
      return callback(err);
    }else{
      if(results.length != 1){
        return callback('More than one label matched!');
      }
      else {
        return callback(null, results[0].fields);
      }
    }
  });
};

exports.newRel = function(relData,callback){
  
    var params = {
        instID: relData.instId,
        usrID: relData.usrID
    };
  
    var query = [
    'MATCH (u),(i) WHERE ID(u)=' + relData.usrID.toString() +' AND ID(i)=' + relData.instId.toString(),
    'MERGE (u)-[:'+relData.relType + ']->(i)',
    'MERGE (u)-[:ADMINS]->(i)'
    ].join('\n');
    
    console.log(query);
    
    db.cypher({query:query, params:null}, function (err, results) {
        if (err){
            console.log(err);
            console.log('Err User newRel');
            return callback(err);
        }else{
            return callback(null);
        }
    });    
};

exports.newPart = function(data,callback){
    
    var query = [
    'MATCH (i) WHERE ID(i)='+data.instID,
    'MERGE (p:'+data.label+'{ partData })-[:PARTOF]->(i)',
	'RETURN ID(p) AS idNEO'
    ].join('\n');
    
    var params = {
        partData: data.partData
    };
    
    db.cypher({query:query, params:params}, function (err, results) {
        if (err){
            console.log(err);
            console.log('Err User newPart');
            return callback(err);
        }
		//console.log('Part: ',results[0]);
        return callback(null,results[0].idNEO);
    });
};

exports.delNodeRel = function(data,callback){

  var query = [
    'MATCH (u)-[r]->(i) WHERE ID(u)='+data.idNEO,
    'AND ID(i)='+data.instID+' AND TYPE(r) IN ["ADMINS", "'+data.relType+'"]',
    'DELETE r'
  ].join('\n');

  db.cypher({query:query, params:null}, function(err, results) {
    if(err){
      console.log(err);
      return callback(err);
    }else{
      return callback(null);
    }
  });
};
