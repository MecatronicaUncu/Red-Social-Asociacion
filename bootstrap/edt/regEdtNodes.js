var csv = require("fast-csv");
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:asoc@localhost:4550'
);

csv
 .fromPath("NodeTypes.csv", {headers:true, comment:'#'})
 .on("data", function(nodeData){
    var query = [
    'merge (a:nodeType {type:"'+nodeData.type+'", label:"'+nodeData.label+'"}) WITH a',
    'SET a.parent = ',
    'CASE WHEN NOT (HAS (a.parent)) THEN "'+nodeData.parent+'"',
    'ELSE a.parent + "'+nodeData.parent+'" END',
    'return id(a) as idneo'
    ].join('\n');

    db.query(query, null, function (err, results) {
      if (err){
        throw err;
        console.log('error creating nodetypes');
      }
    });

    return;
 })
 .on("end", function(){
 	return;
 });
