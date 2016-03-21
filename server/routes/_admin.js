// Admin database access functions

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:neo@localhost:7474'
);

exports.getAdminNodes = function(idNEO, callback){
	
	var query = [
        'MATCH (admin)-[:ADMINS]->(nodes)',
        'WHERE ID(admin) = '+idNEO,
        'OPTIONAL MATCH (nodes)-[:PARTOF]->(parent)',
        'RETURN distinct nodes as nodeData, ID(nodes) AS idNEO,',
        'LABELS(nodes) AS label, parent.name AS parentName'
    ].join('\n');

    db.query(query, null, function (err, results) {
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
    'MATCH (part:nodeType)',
    'WHERE NOT part.type IN ["ActivityType", "User"]',
    'AND part.parent="'+memberof+'"',
    'RETURN part AS nodeData'
  ].join('\n');

  db.query(query, null, function(err, results){
    if(err){
      throw err;
      return callback(err);
    }else{
      var parts = [];
      var rels = [];
      
      results.forEach(function(res){
        res = res.nodeData._data.data;
        if(res.label === 'User'){
          //Handle relationships
        } else {
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

  db.query(query, null, function(err, results){
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
    'CREATE (u)-[:'+relData.relType + ']->(i)'
    ].join('\n');
    
    console.log(query);
    
    db.query(query, null, function (err, results) {
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
    'CREATE (p:'+data.label+'{ partData })-[:PARTOF]->(i)',
	'RETURN ID(p) AS idNEO'
    ].join('\n');
    
    var params = {
        partData: data.partData
    };
    
    db.query(query, params, function (err, results) {
        if (err){
            console.log(err);
            console.log('Err User newPart');
            return callback(err);
        }
		//console.log('Part: ',results[0]);
        return callback(null,results[0].idNEO);
    });
};
