// users.js
// Routes to CRUD users.

var User = require('./user.js');
var path = require('path');
var cookies = require('cookies');
var keygrip = require('keygrip');
var keys = keygrip(["Andres","Franco"]);
exports.CookKeys = keys;
var fs = require('fs'); //FILESYSTEM
var crypto = require('crypto');


/******************************************************************************/
/*                          COOKIES & SECURITY                                */
/******************************************************************************/

/*
 * Hash password
 */
var hash = function(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('base64');
};

/*
 * Call extractCookieData before using this method!
 */
var sameUser = function(id,req,res){
	
	if(req.id == id){
		return true;
	}
	return false;
};

/*
 * Call extractCookieData before using this method!
 */
var loggedIn = function(req,res){
	
	if(req.id){
		return true;
	}
	return false;
};

/*
 * Method to extract cookies
 */
exports.extractCookieData = function (req, res, next){
    
    var cook = new cookies(req, res, keys);
    var idCookie = cook.get('LinkedEnibId');
    
    if(idCookie){

		req.id = idCookie;		
	}
	else{
		console.log('Cookies Errors');
	}
	
	return next();
};

/******************************************************************************/
/*                          GET METHODS                                       */
/******************************************************************************/

/**
 *	TEST MATERIA
 */
exports.materia = function(req, res, next) {
	User.materia(function(err, materias){
		if(err){
			res.send(500, 'Error Materia');
			return;
		}
		res.send(200, {data:materias});
		return;
	});
	
};

/**
 * GET /they -> THEY ARE USING LinkedEnib
 */
exports.getThey = function (req, res, next) {
    User.getThey(function (err, users) {
        if (err){
            res.send(500,'Error');
            return;
        }
        res.send(200, {users:users});
        return;
    });
};

/**
 * GET /:id -> PROFILE
 */
exports.getProfile = function (req, res, next) {
    
    var id = req.params.id;
    if (req.id!==id){
        return next();
    };

    User.getProfile(id,function (err,results) {
        if (err){
            res.send(500,'Error');
            return;
        }
        res.send(200, results);
        return;
    });

};


/**
 * GET /usr/:id -> GET PROFILE
 */
exports.getUsrProfile = function (req, res, next) {
    User.getUsrProfile(req.params.id, function (err, user) {
        if (err){
            res.send(500,'Error');
            return;
        }
        if (user){
            res.send(200,{user:user});
            return;
        }
        res.send(500,'Error');
        return;
    });
};


/**
 * GET /:id/pic -> OWN PROFILE PICTURE
 */
exports.getPicture = function (req, res, next) {
    User.getParam(req.params.id,'url',function(err,value){
        if (err){
            res.send(500,'Error');
            return;
        }
        if (value){
	    var targetPath = path.resolve(path.join(__dirname,value));
            res.status(200).sendfile(targetPath);
            return;
        }
        res.send(500,'Error');
        return;
    });
};

/**
 * GET /img/pub/:name
 */
exports.getPub = function (req, res, next) {
    var file = 'images/pub/' + req.params.name;
    var targetPath = path.resolve(path.join(__dirname,file));
    res.status(200).sendfile(targetPath);
    return;
};

/**
 * GET /:id/isFriend -> IS FRIEND ?
 */
exports.isFriend = function (req,res,next){
    User.isFriend(req.id, req.params.id, function(err,users){
        if (err){
            res.send(500,'Error');
            return;
        }
        res.send(200,{users:users[0]});
        return;
    });
};

/**
 * GET /search -> SEARCH BY
 */
exports.getBy = function (req, res, next) { 
    var temp = [];
    if (req.query.hasOwnProperty('usr'))
        temp.push({label:'username', value:req.query['usr']});
    if (req.query.hasOwnProperty('fnm'))
        temp.push({label:'firstName', value:req.query['fnm']});
    if (req.query.hasOwnProperty('lnm'))
        temp.push({label:'lastName', value:req.query['lnm']});
    if (req.query.hasOwnProperty('prf'))
        temp.push({label:'profession', value:req.query['prf']});
    if (req.query.hasOwnProperty('age'))
        temp.push({label:'age', value:req.query['age']});
    User.getBy(temp,req.id,function(err,users){
        if (err){
            res.send(500,'Error');
            return;
        }
        res.send(200,{users:users});
        return;
    });
};

/******************************************************************************/
/*                          POST METHODS                                      */
/******************************************************************************/

/**
 * POST /signup -> SIGN UP
 */
exports.signup = function (req, res, next) {
    var temp = req.body;
    if (!temp.hasOwnProperty('password') || temp['password']==''){
        res.send(400,'Missing password');
        return;
    }
    if (!temp.hasOwnProperty('username') || temp['username']==''){
        res.send(400,'Missing username');
        return;        
    }

    query = 'username:"' + temp['username'] + '", password:"' + hash(temp['password']) + '"';

    if (temp.hasOwnProperty('firstName') && temp['firstName']) query = query + ', firstName:"' + temp['firstName'] + '"';
    if (temp.hasOwnProperty('lastName') && temp['lastName']) query = query + ', lastName:"' + temp['lastName'] + '"';
    if (temp.hasOwnProperty('email') && temp['email']) query = query + ', email:"' + temp['email'] + '"';

    User.signup(query, function (err, user) {
        if (err) {
            res.send(400,'Username taken');
            return;
        }
        if (user){
		res.send(200,{id:user.id});
		return;
        }
        res.send(500,'Database error');
        return;
    });
};

/**
 * POST /login -> LOG IN
 */
exports.login = function (req, res, next) {
	
	var temp = req.body;
	
	if (!temp.hasOwnProperty('password') || temp['password']==''){
        res.send(400,'Missing password');
        return;
    }
    if (!temp.hasOwnProperty('username') || temp['username']==''){
        res.send(400,'Missing username');
        return;        
    }
	
    User.login(temp['username'], hash(temp['password']), function (err, id) {
        if (err) {
            res.send(401,'Wrong username or password');
            return;
        }
        if (id){
			if(!loggedIn(req,res)){
				var cook = new cookies(req, res, keys);
				cook.set('LinkedEnibId',id, { signed: true, maxAge: 9000000 });
				res.send(200,{id:id});
				return;
			}
			else{
				res.send(401,'Another user already logged in');
				return;
			}
        }
        res.send(401,'Wrong username or password');
        return;
    });
};

/**
 * POST /friend -> FRIEND SOMEBODY
 */
exports.friend = function (req, res, next) {
    if(!sameUser(req.body['idUsr'],req,res)){
        res.send(401,'Unauthorized');
        return;
    }
    User.friend(req.body['idUsr'],req.body['idFriend'], function (err) {
        if (err) {
            res.send(500,'Error');
            return;
        }
        res.send(200,'friend');
        return;
    });
};

/**
 * POST /profilepic/:id -> UPLOAD PICTURE
 */
exports.uploadPic = function (req, res, next) { 
    var id = req.params.id;
    if(!sameUser(id,req,res)){
        res.send(401,'Unauthorized');
        return;
    }
    var tempPath = req.files.image.path;
    var string = 'upload/img'+id+'.jpg';
    var targetPath = path.resolve(path.join(__dirname,string));
    var extension = path.extname(req.files.image.name).toLowerCase();
    if (extension === '.jpeg' || extension === '.png' || extension === '.jpg' || extension === '.bmp') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) {
                res.send(500,'Error');
                return;
            }
            User.changeProperty('url',string,id,function(err){
                if (err){
                    res.send(500,'Error');
                    return;
                }
            });
            res.redirect(200,'http://localhost:9000/#/profile');
            return;
        });
    } else {
        fs.unlink(tempPath, function (err) {
            if (err){
                res.send(500,'Error');
                return;
            }
            res.redirect(400,'http://localhost:9000/#/profile');
            return;
        });
    }
};

/**
 * POST /change -> CHANGE PROPERTY
 */
exports.changeProperty = function (req, res, next) {
    var tmp = req.body;
    
	if(!sameUser(tmp['id'],req,res)){
        res.send(401,'Unauthorized');
        return;
    }
    User.changeProperty(tmp['field'],tmp['value'],tmp['id'],function(err){
        if (err){
            res.send(500,'Error');
            return;
        }
        res.send(200,'OK');
        return;
    });
};

/******************************************************************************/
/*                          DELETE METHODS                                    */
/******************************************************************************/

/**
 * DELETE /delFriend/:friendId/:userId -> DELETE FRIENDSHIP
 */
exports.deleteFriend = function(req,res,next){
    if(!sameUser(req.params.userId,req,res)){
        res.send(401,'Unauthorized');
        return;
    }
    User.deleteFriend(req.params.userId, req.params.friendId, function (err) {
        if (err) {
            res.send(500,'Error');
            return;
        }
        res.send(200,'OK');
        return;
    });
};

/**
 * DELETE /delUser/:id -> DELETE USER
 */
exports.deleteUser = function(req,res,next){
    if(!sameUser(req.params.id,req,res)){
        res.send(401,'Unauthorized');
        return;
    }
    User.deleteUser(req.params.id, function (err) {
        if (err) {
            res.send(500,'Error');
            return;
        }
        return;
    });
};
