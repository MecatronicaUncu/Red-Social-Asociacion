// user.js
// User model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);

var maxNode = 15;
var counter = 11;
var limit = 5;
// private constructor:

var User = module.exports = function User(_node) {
    this._node = _node;
};

Object.defineProperty(User.prototype, 'id', {
    get: function () { return this._node.id; }
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

User.materia = function(callback){
	var query = [
		'MATCH (m:Materia)',
		'RETURN m'].join('\n');

	db.query(query, null, function(err, results) {
		if(err){
			throw err;
			console.log('err materia');
			return callback(err);
		}
		var materias = [];
	        results.forEach(function(el){
        	    var temp = el.m._data.data;
	            materias.push(temp);
	        });
	        return callback(null, materias);
	});

};

User.getThey = function (callback) {
            
    var query = [
        'MATCH (user:User)',
        'WHERE ID(user)<>0',
        'WITH user, rand() AS r',
        'ORDER BY r',
        'RETURN user, ID(user) AS id, count(user) AS max',
        'LIMIT '+limit.toString()
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err){
			throw err;
            console.log("err get All");
            return callback(err);
        }
        var users = [];
        results.forEach(function(el){
            var temp = el.user._data.data;
            if (temp.hasOwnProperty('password')){
                delete temp['password'];
                temp['id']=el.id;
                users.push(temp);
            }
        });
        return callback(null, users);
    });
};

User.getProfile = function(id,callback){

    var query = [
        'MATCH (user:User)',
        'WHERE ID(user)='+ id.toString(),
        'RETURN {user : user, id : ID(user)} AS NODES',
        'UNION',
        'MATCH (user)-[:FRIENDS]->(friend)',
        'WHERE ID(user)='+ id.toString() +' AND (friend)-[:FRIENDS]->(user)',
        'RETURN {friend : friend, id : ID(friend)} AS NODES',
        'UNION',
        'MATCH (requested)-[:FRIENDS]->(user)',
        'WHERE ID(user)='+ id.toString() +' AND NOT (user)-[:FRIENDS]->(requested)',
        'RETURN {requested : requested, id : ID(requested)} AS NODES',
        'UNION',
        'MATCH (user)-[:FRIENDS]->(demanded)',
        'WHERE ID(user)='+ id.toString() +' AND NOT (demanded)-[:FRIENDS]->(user)',
        'RETURN {demanded : demanded, id : ID(demanded)} AS NODES',
        'UNION',
        'MATCH (user)-[:FRIENDS*2..3]-(suggested)',
        'WHERE ID(user)='+ id.toString() +' AND NOT (user)-[:FRIENDS]-(suggested) AND ID(suggested)<>'+ id.toString(),
        'RETURN {suggested : suggested, id : ID(suggested), count : COUNT(suggested)} AS NODES',
        'ORDER BY NODES.count DESC LIMIT 5'
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err){
            throw err;
            console.log("err profile");
            return callback(err);
        }
        var user = {};
        var fri = [];
        var req = [];
        var dem = [];
        var sug = [];
        results.forEach(function(el){
            if (el.NODES.hasOwnProperty('user')){
                delete el.NODES.user._data.data['password'];
                user = el.NODES.user._data.data;
                user['id'] =el.NODES.id;
            }
            else if (el.NODES.hasOwnProperty('friend')){
                delete el.NODES.friend._data.data['password'];
                var tmp = {'data' : el.NODES.friend._data.data, 'id' : el.NODES.id};
                fri.push(tmp);
            }
            else if (el.NODES.hasOwnProperty('requested')){
                delete el.NODES.requested._data.data['password'];
                var tmp = {'data' : el.NODES.requested._data.data, 'id' : el.NODES.id};
                req.push(tmp);
            }
            else if (el.NODES.hasOwnProperty('demanded')){
                delete el.NODES.demanded._data.data['password'];
                var tmp = {'data' : el.NODES.demanded._data.data, 'id' : el.NODES.id};
                dem.push(tmp);
            }
            else{
                delete el.NODES.suggested._data.data['password'];
                var tmp = {'data' : el.NODES.suggested._data.data, 'id' : el.NODES.id};
                sug.push(tmp);
            }
        });
        var temp = {'user' : user, 'friends' : fri, 'requested' : req, 'demanded' : dem, 'suggested' : sug};
        return callback(null,temp);
    });

};

User.getUsrProfile = function (id, callback) {
    var query = [
        'MATCH (user:User)',
        'WHERE ID(user)='+id.toString(),
        'RETURN user, ID(user) AS id'
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err){
            console.log('error get usr prof')
            return callback(err);
        }
        var user = {};
        if (results.length>0){
            if (results[0].hasOwnProperty('user')){
                user = results[0].user._data.data;
                delete user['password'];
                user['id']=results[0].id;
            }
        }
        return callback(null, user);
    });
};

User.getParam = function (id, field, callback) {
    var query = [
        'MATCH (user:User)',
        'WHERE ID(user)='+id.toString(),
        'RETURN user.'+ field + ' AS value'
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err){
            console.log('err get Param');
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
};

User.isFriend = function (id, friend, callback) {
    var query = [
        'MATCH (u:User),(p:User)',
        'WHERE ID(u)='+ id.toString() +' AND ID(p)='+ friend.toString() +' AND (u)-[:FRIENDS]->(p) AND (p)-[:FRIENDS]->(u)',
        'RETURN p'
    ].join('\n');
    
    db.query(query,null,function(err,results){
        if (err) {
            console.log("err is friend");
            return callback(err);
        }
        var back = [];
        if (results[0].p._data.data.hasOwnProperty('password')){
            back.push(1);
        }
        else{
            back.push(0);
        }
        return callback(null,back);
    });
};

User.getBy = function (data, id, callback) {
    
    var i = 0;
    var temp = "(";
    for (var i = 0; i<data.length; i++){
        temp += 'n.' + data[i].label + ' =~ "(?i)' + data[i].value + '.*" or ';
    }
    if (i==0)
        temp = "";
    else
        temp += 'null) and ';
    temp += 'ID(n)<>'+ id.toString();
    
    var query = [
        'MATCH (n:User)',
        'WHERE ' + temp,
        'WITH n',
        'OPTIONAL MATCH (p:User)-[rel:FRIENDS*1..2]-(n)',
        'WHERE ID(p)='+id.toString(),
        'RETURN n,ID(n) AS id, COUNT(rel)',
        'ORDER BY COUNT(rel) DESC LIMIT '+limit.toString()
    ].join('\n');
    
    db.query(query,null,function(err,results){
        if (err) {
            console.log("err get by");
            return callback(err);
        }        
        var users = [];
        results.forEach(function(el){
            var temp = el.n._data.data;
            if (temp.hasOwnProperty('password')){
                delete temp['password'];
                temp['id']=el.id;
                users.push(temp);
            }
        });
        return callback(null,users);
    });
 
};

/******************************************************************************/
/*                          POST METHODS                                      */
/******************************************************************************/
User.signup = function (data, callback) {

   query = [
	'MERGE (user:User {' + data + '})',
	'ON CREATE SET user.c=0',
	'ON MATCH SET user.c=1',
	'RETURN ID(user) AS id, user.c AS c'
    ].join('\n');

    db.query(query, null, function (err, results) {
         if (err){
         	   console.log(err);
               console.log('err sign in');
               return callback(err);
         }
	if (results[0].c == 1) return callback(true);
    return callback(null, results[0]);
    });

};

User.login = function (username, callback) {
    var query = [
        'MATCH (user:User)',
        'WHERE user.username={username}',
        'RETURN ID(user) AS id, user.password AS pass, user.salt AS salt, user.firstName AS firstName, user.lastName AS lastName'
    ].join('\n');

    var params = {
        username: username
    };

    db.query(query, params, function (err, results) {
        if (err) {
            console.log('err log in');
            return callback(err);
        }
        if (results.length>0){
            return callback(null, results[0]);
        }
        console.log('err log in 2');
        return callback(err);
    });
};

User.friend = function (userId, otherId, callback) {

    var query = [
        'MATCH (user1:User),(user2:User)',
        'WHERE ID(user1)='+userId.toString()+' and ID(user2)='+otherId.toString(),
        'CREATE (user1)-[:FRIENDS]->(user2)'
    ].join('\n');
    
    db.query(query, null, function (err) {
        if(err){
            console.log("err friend sbdy");
            return callback(err);
        }
        return callback(null);
    });
};

User.changeProperty = function (field,value,id,callback){
    
    var query = [
        'MATCH (u:User)',
        'WHERE ID(u)='+ id.toString(),
        'SET u.'+field+'="'+value+'"'
    ].join('\n');
    
    db.query(query, null, function (err) {
        if(err){
            console.log("err change prop");
            return callback(err);
        }
        return callback(null);
    });
};

User.verifyPassword = function (id,callback){
    
    var query = [
        'MATCH (u:User)',
        'WHERE ID(u)=' + id.toString(),
        'RETURN u.password AS pass, u.salt AS salt'
    ].join('\n');
    
    db.query(query, null, function (err, results) {
        if(err){
            console.log("err change prop");
            return callback(err);
        }
        return callback(null, results[0]);
    });
};

User.changePassword = function (oldP,newP,newS,id,callback){
    
    var query = [
        'MATCH (u:User)',
        'WHERE ID(u)=' + id.toString(),
        'SET u.password="' + newP + '", u.salt="' +newS + '"'
    ].join('\n');
    
    db.query(query, null, function (err, results) {
        if(err){
            console.log("err change prop");
            return callback(err);
        }
        /*if (results[0].u._data.data.hasOwnProperty('password')){
            return callback(null);
        }*/
        return callback(null);
    });
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
    
    db.query(query, null, function (err) {
        if(err){
            console.log("err del friend");
            return callback(err);
        }
        return callback(null);
    });
};

User.deleteUser = function (userId, callback) {

    var query = [
        'MATCH (user1:User)',
        'WHERE ID(user1)='+userId.toString(),
        'MATCH (user1)-[rel:FRIENDS]-()',
        'DELETE rel,user1'
    ].join('\n');
    
    db.query(query, null, function (err) {
        if(err){
            console.log("err del usr");
            return callback(err);
        }
        return callback(null);
    });
};
