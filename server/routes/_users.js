// user.js
// User model logic.

var neo4j = require('neo4j');
var config = require('./../config/config.js');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
            config.dbURL
);

var maxNode = 15;
var counter = 11;
var limit = 5;
// private constructor:

var privateFields = ['email','phone','address'];

var User = module.exports = function User(_node) {
    this._node = _node;
};

Object.defineProperty(User.prototype, 'id', {
    get: function () { return this._node._id;}
});

Object.defineProperty(User.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    },
    set: function (name) {
        this._node.data['name'] = name;
    }
});

/******************************************************************************/
/*                          GET METHODS                                       */
/******************************************************************************/

User.getAsocs = function(idNEO, callback){

    var query = [
        'MATCH (u:User)-[r]->(i) WHERE ID(u)='+idNEO,
        'AND NOT TYPE(r) IN ["ADMINS","SUBSCRIBED","PARTOF","FRIENDS"]',
        'RETURN TYPE(r) as reltype, LABELS(i) AS label, ID(i) AS instID, i.name AS name'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }else{
                results.forEach(function(res){
                    res.label = res.label[0];
                });

                results.push({label:"PRIVATE",instID:-1,name:"PRIVATE"});
                if(results.length > 0){
                    return callback(null, results);
                }else{
                    return callback(null, null);
                }
            }
        });
    }catch(err){
        return callback(err);
    }
};

User.getProfile = function(idNEO,public,callback){

    var query = [
        'MATCH (u:User) WHERE ID(u)='+idNEO,
        'RETURN u as USER'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }else{
                if(results.length > 0){
                    var profile = results[0].USER.properties;
                    if(public){
                        privateFields.forEach(function(field){
                            delete profile[field];
                        });
                    }
                    delete profile.password;
                    delete profile.salt;
                    delete profile.c;
                    delete profile.lang;
                    return callback(null, profile);
                }else{
                    return callback(null,null);
                }
            }
        });
    }catch(err){
        return callback(err);
    }

};

User.getNodeContents = function(idNEO, callback){

    var query = [
        'MATCH (e)-[r:PARTOF]->(u) WHERE ID(u)='+idNEO.toString(),
        'RETURN distinct e as nodeData, ID(e) AS idNEO, LABELS(e) AS label,',
        'TYPE(r) AS reltype, \'\' AS instName',
        'UNION',
        'MATCH (e)-[r]->(u) WHERE ID(u)='+idNEO.toString(),
        'AND NOT TYPE(r) IN ["PARTOF","ADMINS","SUBSCRIBED","FRIENDS"]',
        'RETURN distinct e as nodeData, ID(e) AS idNEO, LABELS(e) AS label,',
        'TYPE(r) AS reltype, \'\' AS instName'
        //		'UNION',
        //		'MATCH (e)-[r]->(u) WHERE ID(u)='+idNEO.toString()+' WITH e, r.memberAs AS label',
        //		'MATCH (e)-[r]->(inst) WHERE TYPE(r)=label',
        //		'RETURN distinct e as nodeData, ID(e) AS idNEO, LABELS(e) AS label,',
        //		'TYPE(r) AS reltype, inst.name AS instName'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }else{
                var contents = {
                    parts: [],
                    rels: []
                };
                results.forEach(function(res){
                    res.nodeData = res.nodeData.properties;
                    if(res.reltype === 'PARTOF'){
                        res.label = res.label[0];
                        contents.parts.push(res);
                    }else{
                        if(res.nodeData.hasOwnProperty('password')){
                            delete res.nodeData.password;
                            delete res.nodeData.salt;
                            delete res.nodeData.c;
                            delete res.nodeData.active;
                            res.label = res.label[0];
                        }
                        contents.rels.push(res);
                    }
                });
                return callback(null, contents);
            }
        });
    }catch(err){
        return callback(err);
    }
};

User.getThey = function (callback) {

    var query = [
        'MATCH (user:User)',
        'WHERE ID(user)<>0',
        'WITH user, rand() AS r',
        'ORDER BY r',
        'RETURN user, ID(user) AS idNEO, count(user) AS max',
        'LIMIT 50'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }
            var users = [];
            results.forEach(function(el){
                var temp = el.user.properties;
                if (temp.hasOwnProperty('password')){
                    delete temp['password'];
                    delete temp.salt;
                    delete temp.c;
                    temp['idNEO']=el.idNEO;
                    users.push(temp);
                }
            });
            return callback(null, users);
        });
    }catch(err){
        return callback(err);
    }
};

User.getContacts = function(id,callback){

    var query = [
        'MATCH (user:User)-[:FRIENDS]->(friend:User)',
        'WHERE ID(user)='+ id.toString() +' AND (friend:User)-[:FRIENDS]->(user:User)',
        'RETURN {friend : friend, id : ID(friend)} AS NODES',
        'UNION',
        'MATCH (requested:User)-[:FRIENDS]->(user:User)',
        'WHERE ID(user)='+ id.toString() +' AND NOT (user:User)-[:FRIENDS]->(requested:User)',
        'RETURN {requested : requested, id : ID(requested)} AS NODES',
        'UNION',
        'MATCH (user:User)-[:FRIENDS]->(demanded:User)',
        'WHERE ID(user)='+ id.toString() +' AND NOT (demanded:User)-[:FRIENDS]->(user:User)',
        'RETURN {demanded : demanded, id : ID(demanded)} AS NODES',
        'UNION',
        'MATCH (user:User)-[:FRIENDS*2..3]-(suggested:User)',
        'WHERE ID(user)='+ id.toString() +' AND NOT (user:User)-[:FRIENDS]-(suggested:User) AND ID(suggested)<>'+ id.toString(),
        'RETURN {suggested : suggested, id : ID(suggested), count : COUNT(suggested)} AS NODES',
        'ORDER BY NODES.count DESC LIMIT 5'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }
            //var user = {};
            var fri = [];
            var req = [];
            var dem = [];
            var sug = [];
            var tmp;
            results.forEach(function(el){
                /*
                   if (el.NODES.hasOwnProperty('user')){
                   delete el.NODES.user.properties['password'];
                   user = el.NODES.user.properties;
                   user['id'] =el.NODES.id;
                   }
                   else */
                if (el.NODES.hasOwnProperty('friend')){
                    delete el.NODES.friend.properties['password'];
                    delete el.NODES.friend.properties['salt'];
                    delete el.NODES.friend.properties['active'];
                    delete el.NODES.friend.properties['c'];
                    tmp = {'data' : el.NODES.friend.properties, 'idNEO' : el.NODES.id};
                    fri.push(tmp);
                }
                else if (el.NODES.hasOwnProperty('requested')){
                    delete el.NODES.requested.properties['password'];
                    delete el.NODES.requested.properties['salt'];
                    delete el.NODES.requested.properties['active'];
                    delete el.NODES.requested.properties['c'];
                    tmp = {'data' : el.NODES.requested.properties, 'idNEO' : el.NODES.id};
                    req.push(tmp);
                }
                else if (el.NODES.hasOwnProperty('demanded')){
                    delete el.NODES.demanded.properties['password'];
                    delete el.NODES.demanded.properties['salt'];
                    delete el.NODES.demanded.properties['active'];
                    delete el.NODES.demanded.properties['c'];
                    tmp = {'data' : el.NODES.demanded.properties, 'idNEO' : el.NODES.id};
                    dem.push(tmp);
                }
                else{
                    delete el.NODES.suggested.properties['password'];
                    delete el.NODES.suggested.properties['salt'];
                    delete el.NODES.suggested.properties['active'];
                    delete el.NODES.suggested.properties['c'];
                    tmp = {'data' : el.NODES.suggested.properties, 'idNEO' : el.NODES.id};
                    sug.push(tmp);
                }
            });
            return callback(    null,
                                {
                                    /*'user' : user, */
                                    'friends' : fri,
                                    'requested' : req,
                                    'demanded' : dem,
                                    'suggested' : sug
                                });

        });
    }catch(err){
        return callback(err);
    }
};

User.getParam = function (id, field, callback) {
    var query = [
        'MATCH (user)',
        'WHERE ID(user)='+id.toString(),
        'RETURN user.'+ field + ' AS value'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }
            var value;
            if (results.length>0){
                if (results[0]['value']){
                    value = results[0]['value'];
                }
            }
            return callback(null, value);
        });
    }catch(err){
        return callback(err);
    }
};

User.getParamByEmail = function (email, field, callback) {
    var query = [
        'MATCH (user)',
        'WHERE user.email="'+email+'"',
        'RETURN user.'+ field + ' AS value, ID(user) AS id'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }
            var value = "";
            var id = "";
            if (results.length>0){
                if (results[0]['value']){
                    value = results[0]['value'];
                }
                if (results[0]['id']){
                    id = results[0]['id'];
                }
            }

            return callback(null,value,id);
        });
    }catch(err){
        return callback(err);
    }
};

User.isFriend = function (id, friend, callback) {
    var query = [
        'MATCH (u:User),(p:User)',
        'WHERE ID(u)='+ id.toString() +' AND ID(p)='+ friend.toString() +' AND (u)-[:FRIENDS]->(p) AND (p)-[:FRIENDS]->(u)',
        'RETURN p'
    ].join('\n');

    try{
        db.cypher({query:query, params:null},function(err,results){
            if (err) {
                return callback(err);
            }
            var back = [];
            if (results[0].p.properties.hasOwnProperty('password')){
                back.push(1);
            }
            else{
                back.push(0);
            }
            return callback(null,back);
        });
    }catch(err){
        return callback(err);
    }
};

User.getSubscriptions = function (idNEO, callback){

    var query = [
        'MATCH (n:User)-[r:SUBSCRIBED]->(s) WHERE ID(n)='+idNEO,
        'RETURN distinct s, ID(s) AS idNEO, r.mergeCal AS mergeCal'
    ].join('\n');

    try{
        db.cypher({query:query, params:null},function(err,results){
            if (err) {
                return callback(err);
            }
            var subsc = [];
            results.forEach(function(el){
                var temp = el.s.properties;
                temp['idNEO']=el.idNEO;
                temp['mergeCal']=el.mergeCal;
                subsc.push(temp);
            });
            return callback(null,subsc);
        });
    }catch(err){
        return callback(err);
    }
};

User.search = function (what, term, usrId, callback) {

    var userData = ['(n.firstName =~ ".*(?i)'+term+'.*" OR',
        'n.lastName =~ ".*(?i)'+term+'.*" OR',
        'n.email =~ ".*(?i)'+term+'.*" OR',
        'n.profession =~ ".*(?i)'+term+'.*")'].join(' ');

        var partData = '(n.name =~ ".*(?i)'+term+'.*")';

        //    for (var label in data) {
        //        if(data.hasOwnProperty(label)){
        //            if(label != 'parent')
        //                temp += 'n.' + label + ' =~ "(?i)' + data[label] + '.*" OR ';
        //        }
        //    }
        //    //si se busca WHERE (null) no pasa nada !
        //    temp += 'null)';
        //
        //temp += 'ID(n)<>'+ id.toString();

        var userQuery = [
            'MATCH (n:User)',
            'WHERE ' + userData,
            'WITH n',
            'OPTIONAL MATCH (p:User)-[rel:FRIENDS*1..2]-(n)',
            'WHERE ID(p)='+usrId,
            'RETURN distinct n, ID(n) AS idNEO, COUNT(rel)',
            'ORDER BY COUNT(rel) DESC LIMIT '+limit
        ].join('\n');


        // Lo comentado lo saqué por si es más rápido. (no me consta..)
        // Si se agrega, se ordenan según relevancia de contactos.
        var partQuery = [
            'MATCH (n),(p) WHERE NOT n:User AND ' + partData,
            'OPTIONAL MATCH (par)<-[:PARTOF]-(n)',
            //'OPTIONAL MATCH (par)<-[:PARTOF]-(n) WHERE par.name =~ ".*(?i)'+term+'.*"',
            'OPTIONAL MATCH (ppar)<-[:PARTOF*]-(n) WHERE NOT (ppar)-[:PARTOF]->()',
            //'OPTIONAL MATCH (p) WHERE ID(p)='+usrId,
            //'OPTIONAL MATCH (n)<-[relA:SUBSCRIBED]-(p) WHERE ID(p)='+usrId,
            //'OPTIONAL MATCH (p)-[relB:FRIENDS*1..2]-(m)-[relC:SUBSCRIBED]->(n) WHERE ID(p)='+usrId,
            //'OPTIONAL MATCH (p)-[relD:SUBSCRIBED]-()-[relE:PARTOF*]->(n) WHERE ID(p)='+usrId,
            //'OPTIONAL MATCH (p)-[relF:FRIENDS*1..2]-(m)-[relG:SUBSCRIBED]->()-[relH:PARTOF*]->(n) WHERE ID(p)='+usrId,
            'WITH n, par, ppar',//, COUNT(distinct relA) AS crelA, COUNT(distinct relB) AS crelB, COUNT(distinct relD) AS crelD, COUNT(distinct relF) AS crelF, COUNT(distinct relG) AS crelG',
            'RETURN distinct n, ID(n) AS idNEO,par.name AS parentName, ppar.name AS gparentName LIMIT '+limit//, crelA,crelB,crelD,crelF,crelG',
            //'ORDER BY crelA DESC,crelB DESC,crelD DESC,crelF DESC,crelG DESC LIMIT '+limit
        ].join('\n');

        var query;
        if(what==='Parts'){
            query = partQuery;
        }else if (what==='Users'){
            query = userQuery;
        }

        try{
            db.cypher({query:query, params:null},function(err,results){
                if (err) {
                    return callback(err);
                }
                var nodes = [];
                results.forEach(function(el){
                    var temp = el.n.properties;
                    if (temp.hasOwnProperty('password')){
                        //Si tiene password, tiene el resto...
                        delete temp.password;
                        delete temp.email;
                        delete temp.salt;
                        delete temp.c;
                        delete temp.active;
                    }
                    temp['idNEO']=el.idNEO;
                    temp['parentName']=el.parentName;
                    temp['gparentName']=el.gparentName;
                    nodes.push(temp);
                });
                return callback(null,nodes);
            });
        }catch(err){
            return callback(err);
        }
};

/******************************************************************************/
/*                          POST METHODS                                      */
/******************************************************************************/

User.unsubscribe = function(idNEO, instId, callback){

    var params = {
        instID: instId,
        usrID: idNEO
    };

    var query = [
        'MATCH (u)-[r:SUBSCRIBED]->(i) WHERE ID(u)={usrID} AND ID(i)={instID}',
        'DELETE r'
    ].join('\n');

    try{
        db.cypher({query:query, params:params}, function (err, results) {
            if (err){
                return callback(err);
            }else{
                return callback(null);
            }
        });
    }catch(err){
        return callback(err);
    }
};

User.subscribe = function(idNEO, instId, callback){

    var params = {
        instID: instId,
        usrID: idNEO,
        mergeCal: true
    };

    var query = [
        'MATCH (u),(i) WHERE ID(u)={usrID} AND ID(i)={instID}',
        'MERGE (u)-[:SUBSCRIBED {mergeCal: {mergeCal}}]->(i)'
    ].join('\n');

    try{
        db.cypher({query:query, params:params}, function (err, results) {
            if (err){
                return callback(err);
            }else{
                return callback(null);
            }
        });
    }catch(err){
        return callback(err);
    }
};

User.updateProfile = function(idNEO, changes, callback){

    try{
        var params = '';
        for(var key in changes){
            if(changes.hasOwnProperty(key)){
                params += ('u.'+key+'="'+changes[key]+'", ');
            }
        }
        params = params.slice(0,-2);

        var query = [
            'MATCH (u:User) WHERE ID(u)='+idNEO,
            'SET '+params,
            'RETURN u AS USER'
        ].join('\n');

        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }else{
                var profile = results[0].USER.properties;
                delete profile.password;
                delete profile.salt;
                delete profile.c;
                return callback(null, profile);
            }
        });
    }catch(err){
        return callback(err);
    }
};

User.signup = function (nodeData, callback) {

    try{
        /*
         * Solo hacer MATCH con email, porque si las demás propiedades
         * difieren, el server se clava. Las demás agregarlas en ON CREATE
         */
        var email = nodeData.email;
        delete nodeData.email;

        var params = '';
        for(var key in nodeData){
            if(nodeData.hasOwnProperty(key)){
                params += ('user.'+key+'="'+nodeData[key]+'", ');
            }
        }
        // Saca el ultimo ", "
        params = params.slice(0,-2);

        var query = [
            'MERGE (user:User {email:"'+email+'"})',
            'ON CREATE SET user.c=0, '+params+', user.active=0',
            'ON MATCH SET user.c=1',
            'RETURN ID(user) AS idNEO, user.c AS c'
        ].join('\n');

        db.cypher({query:query, params:null}, function (err, results) {
            if (err){
                return callback(err);
            }
            if (results[0].c == 1){
                return callback(null,null);
            }

            return callback(null, results[0].idNEO);
        });
    }catch(err){
        return callback(err);
    }
};

User.login = function (email, callback) {
    var query = [
        'MATCH (user:User)',
        'WHERE user.email={email}',
        'RETURN ID(user) AS idNEO, user.password AS pass,',
        'user.salt AS salt, user.lang AS lang, user.active AS active'
    ].join('\n');

    var params = {
        email: email
    };

    try{
        db.cypher({query:query, params:params}, function (err, results) {
            if (err) {
                return callback(err);
            }
            if (results.length>0){
                return callback(null, results[0]);
            }
            return callback(null,null);
        });
    }catch(err){
        return callback(err);
    }
};

User.friend = function (userId, otherId, callback) {

    var query = [
        'MATCH (user1:User),(user2:User)',
        'WHERE ID(user1)='+userId.toString()+' and ID(user2)='+otherId.toString(),
        'MERGE (user1)-[:FRIENDS]->(user2)'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err) {
            if(err){
                return callback(err);
            }
            return callback(null);
        });
    }catch(err){
        return callback(err);
    }
};

User.activate = function(id,callback){

    var query = [
        'MATCH (u)',
        'WHERE ID(u)='+ id,
        'SET u.active=1'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err) {
            if(err){
                return callback(err);
            }
            return callback(null);
        });
    }catch(err){
        return callback(err);
    }
};

User.changeProperty = function (field,value,id,callback){

    var query = [
        'MATCH (u)',
        'WHERE ID(u)='+ id.toString(),
        'SET u.'+field+'="'+value+'"'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err) {
            if(err){
                return callback(err);
            }
            return callback(null);
        });
    }catch(err){
        return callback(err);
    }
};

User.changePassword = function (newP,newS,id,callback){

    var query = [
        'MATCH (u)',
        'WHERE ID(u)=' + id.toString(),
        'SET u.password="' + newP + '", u.salt="' +newS + '"'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err, results) {
            if(err){
                return callback(err);
            }
            else{
                return callback(null);
            }
        });
    }catch(err){
        return callback(err);
    }
};

/******************************************************************************/
/*                          DELETE METHODS                                    */
/******************************************************************************/

User.deleteFriend = function (userId, otherId, callback) {

    var query = [
        'MATCH (user1:User),(user2:User)',
        'WHERE ID(user1)='+userId.toString()+' and ID(user2)='+otherId.toString(),
        'MATCH (user1)-[rel:FRIENDS]-(user2)',
        'DELETE rel'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err) {
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

User.deleteUser = function (userId, callback) {

    var query = [
        'MATCH (user1:User)',
        'WHERE ID(user1)='+userId.toString(),
        'OPTIONAL MATCH (user1)-[rel:FRIENDS]-()',
        'DELETE rel,user1'
    ].join('\n');

    try{
        db.cypher({query:query, params:null}, function (err) {
            if(err){
                return callback(err);
            }
            return callback(null);
        });
    }catch(err){
        return callback(err);
    }
};
