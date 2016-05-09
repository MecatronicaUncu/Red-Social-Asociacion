// users.js
// Routes to CRUD users.

var User = require('./_users.js');
var path = require('path');
var cookies = require('cookies');
var fs = require('fs'); //FILESYSTEM
var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;
var secur = require('./secur.js');
var config = require('./../config/config.js');

/******************************************************************************/
/*                          LOAD TRANSLATIONS                                 */
/******************************************************************************/
var translations;

var transFile = path.resolve(path.join(__dirname, '../config/translations.json'));
    
/**
 * TODO : Comment on functionality. Conviene hacer throw err???
 */
fs.readFile(transFile, 'utf-8', function (err, t) {
    if (err){
        throw err;
    }
    else{
        translations = JSON.parse(t);
    }
});  

/**
 * Sends mail.
 * @param {string} email: The user's mail adress
 * @param {string} hash: The user's hashed password
 * @returns {bool} Success state.
 */
var sendActivationEmail = function(email,hash,name,lastname,callback){
	
	if (!config.mailServedConfigured)
	{
		console.error("No se ha configurado el servidor mail");
		return callback(false);
	}
	
	try{
		var templatesDir = path.resolve(path.join(__dirname, '../templates/email_activacion/'));
		var emailTemplate = new EmailTemplate(templatesDir);
		
		// Prepare nodemailer transport object
		var transport = nodemailer.createTransport({
			service: config.smtpHost,
			auth: {
				user: config.smtpUser,
				pass: config.smtpPass
			}
		});
		
		//URL encoding
		var hashRep = hash.replace("+","%2B");
		
		// An example users object with formatted email function
		var locals = {
		  email: email,
		  //hash: hash,
		  link: config.domain+'/activate?email='+email+'&hash='+hashRep,
		  name: name,
		  lastname: lastname
		};
		
		// Send a single email
		emailTemplate.render(locals, function (err, results) {
		  if (err) {
			console.error("Error: "+ err);
			return callback(false);
		  }

		  transport.sendMail({
			from: config.mailFrom,
			to: locals.email,
			subject: 'Activacion',
			html: results.html,
			attachments: [{
							filename: 'pubMECUNCU.jpg',
							path: path.resolve(path.join(templatesDir, 'pubMECUNCU.jpg')),
							cid: 'unique@gmail' //same cid value as in the html img src
						}]
		  }, function (err, responseStatus) {
			if (err) {
			  console.error("Error: " + err)
			  return callback(false);
			}
			console.log(responseStatus.message);
			return callback(true);
		  })
	  })
	}catch(err){
		console.error("Error: " + err);
		return callback(false);
	}
};

/******************************************************************************/
/*                          GET METHODS                                       */
/******************************************************************************/

/**
 * TODO : Comment on functionality
 */
exports.getTranslation = function(req,res,next){
    
    var lang = req.params.lang;
    if(!lang){
        res.status(400).send('Error');
    }else if(translations.hasOwnProperty(lang)){
        res.status(200).send({translation: translations[lang]});
    }else{
        res.status(404).send('translation for: '+lang+' not found');
    }

};

/**
 * TODO : Comment on functionality
 */
exports.getAsocs = function (req, res, next) {

    if (!req.id) {
        res.status(401).send('Unauthorized');
        return;
    }

    User.getAsocs(req.id, function (err, asocs) {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
			if (!asocs){
				res.sendStatus(204);
				return;
			}
            res.status(200).send({asocs: asocs});
            return;
        }
    });
};

/**
 * TODO : Comment on functionality
 */
exports.getProfile = function (req, res, next) {

    var idNEO;
    var public = true;

    if (req.params.id) {
        idNEO = parseInt(req.params.id);
        public = !secur.sameUser(idNEO, req, res);
    } else if (req.id) {
        idNEO = req.id;
        public = false;
    } else {
        res.status(401).send('Unauthorized');
        return;
    }

    User.getProfile(idNEO, public, function (err, profile) {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
			if (!profile){
				res.sendStatus(204);
				return;
			}
            res.status(200).send(profile);
            return;
        }
    });
};

/**
 * Sends a random sample of users/organisms using this website.
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Fcuntion} next: Function that executes next
 * @returns {void} Nothing, but sends in the HTTP response the users as an 
 * Object.
 */
exports.getThey = function (req, res, next) {
    User.getThey(function (err, users) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send({they: users});
        return;
    });
};

/**
 * Sends user contacts.
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing, but sends in the HTTP response the contacts as an 
 * Object.
 */
exports.getContacts = function (req, res, next) {
    
    if(!req.id){
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.getContacts(req.id, function (err, contacts) {
        if (err) {
            res.status(500).send(err);
            return;
        }else {
            res.status(200).send(contacts);
            return;
        }
    });
};

/**
 * Sends parts and users that are related to this node ID.
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing.
 */
exports.getNodeContents = function (req, res, next) {

    //Solo para instituciones
    var nodeID = req.query.institutionID;

    User.getNodeContents(nodeID, function (err, contents) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (contents) {
            //Mongo.getNodeContentsData(req, res, contents);
            res.status(200).send(contents);
            return;
        }
        res.sendStatus(204);
        return;
    });

};

/**
 * Send the specified user's profile picture
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing.
 */
exports.getPicture = function (req, res, next) {
    User.getParam(req.params.id, 'url', function (err, value) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (value) {
            var targetPath = path.resolve(path.join(__dirname, value));
            res.status(200).sendFile(targetPath);
            return;
        }
        res.sendStatus(204);
        return;
    });
};

/**
 * Sends the selected publicity's picture
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing.
 */
exports.getPub = function (req, res, next) {
    var file = 'images/pub/' + req.params.name;
    var targetPath = path.resolve(path.join(__dirname, file));
    res.status(200).sendFile(targetPath);
    return;
};

/**
 * TODO : Comment on functionality
 */
exports.isFriend = function (req, res, next) {
    User.isFriend(req.id, req.params.id, function (err, users) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send({users: users[0]});
        return;
    });
};

/**
 * TODO : Comment on functionality
 */
exports.getSubscriptions = function (req, res, next){
    
    if (!req.id){
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.getSubscriptions(req.id, function(err, subsc){
        if(err){
            res.status(500).send(err);
            return;
        }else{
            res.status(200).send(subsc);
            return;
        }
    });
};

/**
 * Searches in the database for nodes matching the search string and sends them.
 * Matches for: first name, last name, email, profession
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing.
 */
exports.search = function (req, res, next) {
//    var temp = {}

//    if (req.query.hasOwnProperty('fnm'))
//        temp.firstName = req.query['fnm'];
//    if (req.query.hasOwnProperty('lnm'))
//        temp.lastName = req.query['lnm'];
//    if (req.query.hasOwnProperty('prf'))
//        temp.profession = req.query['prf'];
//    if (req.query.hasOwnProperty('ema'))
//        temp.email = req.query['ema'];
//    if (req.query.hasOwnProperty('nam'))
//        temp.name =  req.query['nam'];
//    if (req.query.hasOwnProperty('par'))
//        temp.parent = req.query['par'];

    if(!req.id){
        req.id = 0;
    }
    
    var what = req.query.what;
    if (what !== 'Parts' && what !== 'Users'){
        res.status(400).send('what not defined');
		return;
    }

    User.search(what, req.query.term, req.id, function (err, results) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send(results);
        return;
    });
};

/**
 * Activates account
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing.
 */
exports.activate = function (req, res, next) {

    var nodeData = req.query;
    if (!nodeData.hasOwnProperty('hash') || nodeData['hash'] == '') {
        res.status(400).send('Missing password');
        return;
    }
    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.status(400).send('Missing email');
        return;
    }

    User.getParamByEmail(nodeData['email'], 'password',function (err, value,id) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        if(!value){
			res.status(400).send('Something went wrong');
            return;
        }

        if (nodeData['hash'] !== value) {
            res.status(400).send('Something went wrong');
            return;
        };
        
        User.activate(id, function (errAct){
            if (errAct) {
                res.status(401).send(errAct);
                return;
            }
            res.status(200).send('<html><head><meta http-equiv="refresh" content="3;url='+config.domain+'" /></head><body><h1>Su cuenta ha sido activada. Redireccionando en 3 segundos...</h1></body></html>');
            return;
        });
    });
};

/******************************************************************************/
/*                          POST METHODS                                      */
/******************************************************************************/

/**
 * TODO : Comment on functionality
 */
exports.unsubscribe = function(req, res, next){
    
    if (!req.id || !req.body.instID){
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.unsubscribe(req.id, req.body.instID, function(err){
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send('OK');
        }
    });
};

/**
 * TODO : Comment on functionality
 */
exports.subscribe = function(req, res, next){
    
    if (!req.id || !req.body.instID){
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.subscribe(req.id, req.body.instID, function(err){
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send('OK');
        }
    });
};

/**
 * TODO : Comment on functionality
 */
exports.updateProfile = function (req, res, next) {

    if (!secur.sameUser(req.body.id, req, res)) {
        res.status(401).send('Unauthorized');
        return;
    }

    var changes = req.body.changes;
    var idNEO = req.body.id;

    User.updateProfile(idNEO, changes, function (err, profile) {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
            res.status(200).send(profile);
            return;
        }
    });
};

/**
 * TODO : Comment on functionality
 */
exports.signup = function (req, res, next) {
    var nodeData = req.body;
    if (!nodeData.hasOwnProperty('password') || nodeData['password'] == '') {
        res.status(400).send('Missing password');
        return;
    }

    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.status(400).send('Missing email');
        return;
    }
    
    var email = nodeData.email;
    var tempPass = secur.hash(nodeData['password'], null);
    nodeData.password = tempPass['pass'];
    nodeData.salt = tempPass['salt'];
    //nodeData['active'] = 0;
    // ES NECESARIO VERIFICAR ?
    //if (temp.hasOwnProperty('firstName') && temp['firstName']) query = query + ', firstName:"' + temp['firstName'] + '"';
    //if (temp.hasOwnProperty('lastName') && temp['lastName']) query = query + ', lastName:"' + temp['lastName'] + '"';

    User.signup(nodeData, function (err, idNEO) {
        if (err) {
            res.status(500).send(err);
            return;
        } else if (idNEO) {
			var ret = false;
			sendActivationEmail(email,tempPass['pass'],nodeData['firstName'],nodeData['lastName'],function(result){});
			res.status(200).send({idNEO: idNEO});
			return;
        } else {
            res.status(403).send('Email taken');
            return;
        }
    });
    
};

/**
 * TODO : Comment on functionality
 */
exports.login = function (req, res, next) {

    var nodeData = req.body;
    if (!nodeData.hasOwnProperty('password') || nodeData['password'] == '') {
        res.status(400).send('Missing password');
        return;
    }
    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.status(400).send('Missing email');
        return;
    }

    User.login(nodeData['email'], function (err, results) {
		
        if (err) {
            res.status(500).send(err);
            return;
        }
        else if (!results){
			res.status(401).send('Wrong email or password');
            return;
		}
        else if (results['active']!==1){
            res.status(401).send('Email not activated')
            return;
        }

        var secPass = secur.hash(nodeData['password'], results['salt']);

        if (secPass['pass'] !== results['pass']) {
            res.status(401).send('Wrong email or password');
            return;
        };
        
        if (results['idNEO']) {
            if (!secur.loggedIn(req, res)) {
                var cook = new cookies(req, res, secur.cookKeys);
                cook.set('RedSocialAsociacionID', results.idNEO, {signed: true, maxAge: 9000000});
                cook.set('RedSocialAsociacionLANG', results.lang, {signed: true, maxAge: 9000000});
                secur.isAdmin(results.idNEO,function(is){
                  if(is){
                    res.status(200).send({idNEO: results['idNEO'], lang: results.lang, admin: true});
                    return;
                  }else{
                    res.status(200).send({idNEO: results['idNEO'], lang: results.lang, admin: false});
                    return;
                  }
                });
            }
            else {
                res.status(401).send('Another user already logged in');
                return;
            }
        }else{
          res.status(401).send('Wrong email or password');
          return;
        }
    });
};

/**
 * TODO : Comment on functionality
 */
exports.friend = function (req, res, next) {
    
    if (!req.id || !req.body.idFriend || !(req.body.idFriend != req.id)) {
        res.status(401).send('Unauthorized');
        return;
    }

    User.friend(req.id, req.body['idFriend'], function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send('friend');
        return;
    });
};

/**
 * TODO : Comment on functionality
 */
exports.uploadPic = function (req, res, next) {
    var id = req.params.id;
    if (!secur.sameUser(id, req, res)) {
        res.status(401).send('Unauthorized');
        return;
    }
    try{
		var tempPath = req.file.path;
		var string = 'upload/img' + id + '.jpg';
		var targetPath = path.resolve(path.join(__dirname, string));
		var extension = path.extname(req.file.originalname).toLowerCase();
		if (extension === '.jpeg' || extension === '.png' || extension === '.jpg' || extension === '.bmp') {
			fs.rename(tempPath, targetPath, function (err) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				User.changeProperty('url', string, id, function (err) {
					if (err) {
						res.status(500).send(err);
						return;
					}
				});
				res.redirect(200, 'http://localhost:9000/#/profile');
				return;
			});
		} else {
			fs.unlink(tempPath, function (err) {
				if (err) {
					res.status(500).send(err);
					return;
				}
				res.redirect(400, 'http://localhost:9000/#/profile');
				return;
			});
		}
	}catch(err){
		res.status(500).send(err);
		return;
	}
};

/**
 * TODO : Comment on functionality
 */
exports.changeProperty = function (req, res, next) {
    var tmp = req.body;

    if (tmp.hasOwnProperty('password')) {
        next();
        return;
    }

    if(!req.id || !tmp.field || !tmp.value){
        res.sendStatus(401);
        return;
    }
    
    User.changeProperty(tmp.field, tmp.value, req.id, function(err){
        if(err){
            res.sendStatus(500).send(err);
        }else{
          if(tmp.field === 'lang'){
            var cook = new cookies(req, res, secur.cookKeys);
            cook.set('RedSocialAsociacionLANG', tmp.value, {signed: true, maxAge: 9000000, overwrite: true});
            res.sendStatus(200);
          }else{
            res.sendStatus(200);
          }
        }
    });
};

exports.changePassword = function (req, res, next) {

    var pswdNew = secur.hash(req.body['new'], null);

    User.changePassword(pswdNew['pass'], pswdNew['salt'], req.body['id'], function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(200).send('OK');
        return;
    });
};

/******************************************************************************/
/*                          DELETE METHODS                                    */
/******************************************************************************/

/**
 * TODO : Comment on functionality
 */
exports.deleteFriend = function (req, res, next) {
    
    if (!req.id || !req.body.idFriend || !(req.body.idFriend != req.id)) {
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.deleteFriend(req.id, req.body.idFriend, function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }else{
            res.status(200).send('OK');
            return;
        }
    });
};

/**
 * DELETE /delUser/:id -> DELETE USER
 */
exports.deleteUser = function (req, res, next) {
    if (!secur.sameUser(req.params.id, req, res)) {
        res.status(401).send('Unauthorized');
        return;
    }
    User.deleteUser(req.params.id, function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.sendStatus(200);
        return;
    });
};
