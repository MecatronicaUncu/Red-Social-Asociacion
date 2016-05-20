// edt database access functions

var neo4j = require('neo4j');
var config = require('./../config/config.js');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
            config.dbURL
);

exports.getTimes = function(timeData, callback){

    var query = [
        'MATCH (a:ACTIVITY) WHERE'
    ];

    var whereQuery = '(';
    if(timeData.ids.length === 0){
        whereQuery += ' FALSE';
    }else{
        timeData.ids.forEach(function(id){
            whereQuery += 'a.whatId='+id+' OR ';
        });
        whereQuery = whereQuery.slice(0,-4);
    }
    if(timeData.me){
        whereQuery += ' OR a.whoId='+timeData.myID;
    }
    whereQuery += ')';
    query.push(
        whereQuery,
        ' AND a.week='+timeData.week+' AND a.year='+timeData.year,
        'RETURN DISTINCT a AS time, ID(a) AS idNEO'
    );
    query = query.join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, res) {
            if (err){
                return callback(err);
            }else{
                var times = [];
                res.forEach(function(time){
                    time.time.properties['idNEO']=time.idNEO;
                    times.push(time.time.properties);
                });
                return callback(null, times);
            }
        });
    }catch(err){
        return callback(err);
    }
};

exports.getActivityTypes = function(parent, callback){

    var query = [
        'MATCH (a:nodeType)',
        'WHERE ANY (p IN a.parent WHERE p IN ["ALL", "'+parent+'"])',
        'AND a.type="ActivityType"',
        'RETURN a AS activityType, ID(a) AS idNEO'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function(err, res) {
            if(err){
                return callback(err);
            } else {
                var activityTypes = [];
                res.forEach(function(type){
                    type.activityType.properties['idNEO']=type.idNEO;
                    activityTypes.push(type.activityType.properties);
                });
                return callback(null, activityTypes);
            }
        });
    }catch(err){
        return callback(err);
    }
};

exports.newActivity = function(myID, acts, callback){

    var ids = [];
    var query = '';

    try{
        acts.forEach(function(act){
            var params = '';
            for(var key in act){
                if(act.hasOwnProperty(key)){
                    if(typeof act[key] == "number"){
                        params += (key+':'+act[key]+', ');
                    }
                    else{
                        params += (key+':"'+act[key]+'", ');
                    }
                }
            }
            //Borra el ultimo ', ' no deseado.
            params = params.slice(0,-2);

            query = query.concat(
                [
                    'MATCH (u) WHERE ID(u)={myID} WITH u',
                    'MERGE (a:ACTIVITY {'+params+'})-[r:CREATED_BY]->(u)',
                    'RETURN ID(a) AS idNEO',
                    'UNION',
                    ''
                ].join('\n'));
        });

        //REMOVES LAST UNION\n
        query = query.slice(0,-6);

        var params = {
            myID: myID
        };

        db.cypher({query:query, params:params}, function (err, results) {
            if (err){
                return callback(true);
            }else{
                results.forEach(function(el){
                    ids.push(el.idNEO);
                });
                query = [
                    'MATCH (a:ACTIVITY) WHERE ID(a) IN ['+ids+']',
                    'SET a.group='+ids[0]
                ].join('\n');

                db.cypher({query:query, params:null}, function (err, results) {
                    if (err){
                        return callback(true);
                    }else{
                        return callback(false,ids);
                    }
                });
            }
        });
    }catch(err){
        return callback(err);
    }
};

exports.mergeCalendar = function(myID, subID, mergeCal, callback){

    var params = {
        myID: myID,
        subID: subID,
        mergeCal: mergeCal
    };

    var query = [
        'MATCH (u)-[r]->(i) WHERE ID(u)={myID}',
        'AND ID(i)={subID}',
        'SET r.mergeCal={mergeCal}'
    ].join('\n');
    try {
        db.cypher({query: query, params:params}, function (err, results) {
            if(err){
                return callback(err);
            }else{
                return callback(null);
            }
        });
    }catch(err){
        return callback(err);
    }
};
