// edt database access functions

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:neo@localhost:7474'
);

exports.getTimes = function(timeData, callback){
    
    var query = [
        'MATCH (a:ACTIVITY)',
        'WHERE (a.whatId='+timeData.whatId+' OR a.whoId='+timeData.whoId+')',
        'AND a.week='+timeData.week+' AND a.year='+timeData.year,
        'RETURN a AS time, ID(a) AS idNEO'
    ].join('\n');
    
    db.query(query, null, function (err, res) {
        if (err){
			throw err;
            console.log("err get Profile");
            return callback(err);
        }else{
            var times = [];
            res.forEach(function(time){
                time.time._data.data['idNEO']=time.idNEO;
                times.push(time.time._data.data);
            });
            return callback(null, times);
        }
     });  
};

exports.getActivityTypes = function(parent, callback){
  
  var query = [
    'MATCH (a:nodeType)',
    'WHERE ANY (p IN a.parent WHERE p IN ["ALL", "'+parent+'"])',
    'RETURN a AS activityType, ID(a) AS idNEO'
  ].join('\n');

  db.query(query, null, function(err, res) {
    if(err){
      throw err;
      return callback(err);
    } else {
      var activityTypes = [];
      res.forEach(function(type){
        type.activityType._data.data['idNEO']=type.idNEO;
        activityTypes.push(type.activityType._data.data);
      });
      return callback(null, activityTypes);
    }
  });
};

exports.newActivity = function(acts, callback){
    
    var ids = [];
    var query = '';
    
    acts.forEach(function(act){
        var params = '';
        for(var key in act){
            if(act.hasOwnProperty(key)){
                if(typeof act[key] == "number")
                    params += (key+':'+act[key]+', ');
                else
                    params += (key+':"'+act[key]+'", ');
            }
        }
        //Borra el ultimo ', ' no deseado.
        params = params.slice(0,-2);    

        query = query.concat(
            ['CREATE (a:ACTIVITY {'+params+'})',
            'RETURN ID(a) AS idNEO',
            'UNION',
            ''
            ].join('\n'));
    });
    
    //REMOVES LAST UNION\n
    query = query.slice(0,-6);
    
    db.query(query, null, function (err, results) {
        if (err){
            console.log(err);
            console.log("err USER newActivity");
            return callback(true);
        }else{
            results.forEach(function(el){
                ids.push(el.idNEO);
            });
            query = [
                'MATCH (a:ACTIVITY) WHERE ID(a) IN ['+ids+']',
                'SET a.group='+ids[0]
            ].join('\n');
            
            db.query(query, null, function (err, results) {
                if (err){
                    console.log(err);
                    console.log("err USER newActivity");
                    return callback(true);
                }else{
                    return callback(false,ids);
                }
            });  
        }
    });    
};
