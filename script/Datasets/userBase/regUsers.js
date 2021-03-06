var csv = require("fast-csv");
var neo4j = require('neo4j');
var config = require('../../../server/config/config.js');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    config.dbURL
);

csv
 .fromPath("people_email_pass_salt.csv", {headers:true})
 .on("data", function(nodeData){
    var params = '';
	for(var key in nodeData){
	    if(nodeData.hasOwnProperty(key))
	        params += ('user.'+key+'="'+nodeData[key]+'", ');
	}
	// Saca el ultimo ", "
	params = params.slice(0,-2);

	var query = [
	'MERGE (user:User {email:"'+nodeData.email+'"})',
	'ON CREATE SET user.c=0, '+params+', user.active=1',
	'ON MATCH SET user.c=1',
	'RETURN ID(user) AS idNEO, user.c AS c'
	].join('\n');

	db.cypher({query:query, params:null}, function (err, results) {
	    if (err){
	        throw err;
	        console.log('Error creating test dataset');
	    }
	    process.stdout.write(results[0].idNEO+',');
	    return;
	});
 })
 .on("end", function(){
 	return;
 });
