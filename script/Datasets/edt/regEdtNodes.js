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

var datasetFile = path.resolve(path.join(__dirname, 'edtDataset.json'));

function nextChar(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

function prevChar(c) {
  return String.fromCharCode(c.charCodeAt(0) - 1);
}

fs.readFile(datasetFile, 'utf-8', function (err, nf) {
  if (err){
    throw err;
  }
  else{
    nodes = JSON.parse(nf);

    if(!nodes.hasOwnProperty("nodes")){
      console.log("Error reading EDT JSON file");
      return;
    }

    var query_inst = '';
    var query_user = '';
    var charCode_inst = 'a';
    var charCode_user = 'a';

    nodes.nodes.forEach(function(node){

      var fields = '';

      if(node.hasOwnProperty("fields")){
        for(var field in node.fields){
          if(node.fields.hasOwnProperty(field)){
            fields += field+': "'+node.fields[field]+'", ';
          }
        }

        fields = fields.slice(0,-2);
      }

      //FIRST QUERY FOR INSTITUTION

      if(node.type!=='User' && node.hasOwnProperty("parentName")){

        query_inst += [
          'MATCH ('+charCode_inst+') WHERE '+charCode_inst+'.name="'+node.parentName+'"',
          'MERGE ('+nextChar(charCode_inst)+':'+node.type+' {'+fields+'})-[r:PARTOF]->('+charCode_inst+') WITH '+nextChar(charCode_inst)
        ].join('\n');
        query_inst += '\n';

        charCode_inst = nextChar(nextChar(charCode_inst));
      } else if (node.type !== 'User'){

        query_inst += [
          'MERGE ('+charCode_inst+':'+node.type+' {'+fields+'}) WITH '+charCode_inst
        ].join('\n');
        query_inst += '\n';

        charCode_inst = nextChar(charCode_inst);
      } else if (node.type === 'User') {

        //SECOND QUERY FOR ADMINS

        query_user += [
          'MATCH ('+charCode_user+':User),('+nextChar(charCode_user)+') WHERE '+charCode_user+'.email="'+node.usermail+'" AND '+nextChar(charCode_user)+'.name="'+node.instName+'"',
          'MERGE ('+charCode_user+')-[r:ADMINS]->('+nextChar(charCode_user)+') WITH '+charCode_user+','+nextChar(charCode_user),
          'MERGE ('+charCode_user+')-[r:'+node.relType+']->('+nextChar(charCode_user)+') WITH '+nextChar(charCode_user)
        ].join('\n');
        query_user += '\n';

        charCode_user = nextChar(nextChar(charCode_user));
      }

      return;
    });

    query_inst += 'RETURN '+prevChar(charCode_inst);
    query_user += 'RETURN '+prevChar(charCode_user);

    db.query(query_inst, null, function (err, results) {
      if (err){
        throw err;
        console.log('error creating edt dataset');
      }else{
        db.query(query_user, null, function(err, results){
          if(err){
            throw err;
            console.log('Error creating edt dataset');
          }
        });
      }
    });
  }
});
