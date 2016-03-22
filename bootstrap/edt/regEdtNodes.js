var neo4j = require('neo4j');
var path = require('path');
var fs = require('fs');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:neo@localhost:7474'
);

var nodes;

var nodesFile = path.resolve(path.join(__dirname, 'NodeTypes.json'));

fs.readFile(nodesFile, 'utf-8', function (err, nf) {
  if (err){
    throw err;
  }
  else{
    nodes = JSON.parse(nf);

    if(!nodes.hasOwnProperty("nodes")){
      console.log("Error reading EDT JSON file");
      return;
    }

    nodes.nodes.forEach(function(node){

      var parents = '';
      var fields = '';

      node.parent.forEach(function(p){
        parents += '"'+p+'", ';
      });

      // Removes last ", "
      parents = parents.slice(0,-2);

      if(node.hasOwnProperty("fields")){
        node.fields.forEach(function(f){
          fields += '"'+f+'", ';
        });

        fields = fields.slice(0,-2);
      }

      var query = [
        'MERGE (a:nodeType {type:"'+node.type+'", label:"'+node.label+'"})',
        'ON CREATE SET a.parent = ['+parents+'], a.fields = ['+fields+']',
        'return id(a) as idneo'
      ].join('\n');

      db.query(query, null, function (err, results) {
        if (err){
          throw err;
          console.log('error creating nodetypes');
        }
      });

      return;
    });
  }
});
