// users.js
// Routes to CRUD users.

var User = require('./user.js');
var Mongo = require('./mongo.js');
var path = require('path');
var cookies = require('cookies');
var keygrip = require('keygrip');
var keys = keygrip(["Andres", "Franco"]);
exports.CookKeys = keys;
var fs = require('fs'); //FILESYSTEM
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var templatesDir   = path.resolve(path.join(__dirname, '../templates'));
var emailTemplates = require('email-templates');


/******************************************************************************/
/*                          COOKIES & SECURITY                                */
/******************************************************************************/

/** 
 * Hash password
 * @param {String} pwd: The user's password
 * @param {String} salt: The user password's salt
 * @returns {Object} Password hash (.pass) and salt (.salt)
 */
var hash = function (pwd, salt) {
    if (!salt) {
        try {
            var buf = crypto.randomBytes(64);
            salt = buf.toString('base64');
        }
        catch (ex) {
            throw ex;
        }
    }
    var pass = salt + pwd;

    var passHash = crypto.createHash('sha256').update(pass).digest('base64');
    var temp = {'pass': passHash, 'salt': salt};
    return temp;
};

/**
 * Checks if the given ID matches the cookie ID. Call extractCookieData
 * before using this method!
 * @param {Integer} id: The user's ID
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @returns {Boolean} True if the IDs match false otherwise.
 */
var sameUser = function (id, req, res) {

    if (req.id == id) {
        return true;
    }
    return false;
};
exports.sameUser = sameUser;

/**
 * Checks the presence of an ID in the headers (if the user is logged in). Call 
 * extractCookieData before using this method!
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @returns {Boolean} True if the user is logged in, false otherwise.
 */
var loggedIn = function (req, res) {

    if (req.id) {
        return true;
    }
    return false;
};

/**
 * Checks if the user doing the request is administrator.
 * @param {Integer} id: The user's ID
 * @param {Function} next: Function that executes next
 * @returns {callback} Runs next function.
 */
var isAdmin = function (id, next) {

    User.isAdmin(id, function (is) {
        if (is)
            return next(true);
        else
            return next(false);
    });
};
exports.isAdmin = isAdmin;

/*
 * Method to extract cookies
 */
/**
 * Extracts the cookies from the HTTP request header
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {callback} Runs next function.
 */
exports.extractCookieData = function (req, res, next) {

    var cook = new cookies(req, res, keys);
    var idCookie = cook.get('LinkedEnibId');
    var langCookie = cook.get('LinkedEnibLang');

    if (idCookie && langCookie) {

        req.id = parseInt(idCookie);
        req.lang = langCookie;
    }
    else {
        console.log('Cookies Errors');
    }

    return next();
};

/**
 * Sends mail.
 * @param {string} email: The user's mail adress
 * @param {string} hash: The user's hashed password
 * @returns {bool} Success state.
 */
var sendActivationEmail = function(email,hash){

    emailTemplates(templatesDir, function (err, template) {

        if (err) {
            console.log(err);
            return false;
        } else {

            // ## Send a single email

            // Prepare nodemailer transport object
            var transport = nodemailer.createTransport("SMTP", {
                service: "Gmail",
                auth: {
                    user: "samplesample978@gmail.com",
                    pass: "sampleMail"
                }
            });
            
            //URL encoding
            var hashRep = hash.replace("+","%2B");
            
            // An example users object with formatted email function
            var locals = {
              email: email,
              //hash: hash,
              link: 'https://127.0.0.1:3000/activate?email='+email+'&hash='+hashRep
            };

            // Send a single email
            template('email_activacion', locals, function(err, html, text) {
              if (err) {
                console.log(err);
                return false;
              } else {
                transport.sendMail({
                  from: 'Admin <admin@admin.com>',
                  to: locals.email,
                  subject: 'Activacion',
                  html: html
                  // generateTextFromHTML: true,
                }, function(err, responseStatus) {
                    if (err) {
                        console.log(err);
                        return false;
                    } else {
                        transport.sendMail({
                        from: 'Admin <admin@admin.com>',
                        to: locals.email,
                        subject: 'Activacion',
                        html: html,
                        // generateTextFromHTML: true,
                    }, function (err, responseStatus) {
                        if (err) {
                            console.log(err);
                            return false;
                        } else {
                            console.log(responseStatus.message);
                        }
                    });
                }
                });
            }
        });
        }
    });
    return true;
};

/******************************************************************************/
/*                          GET METHODS                                       */
/******************************************************************************/

exports.getTimes = function(req, res, next){
  
    var timeData = {
        whatId: req.query.whatId,
        whoId: req.query.whoId,
        week: req.query.week,
        year: req.query.year,
    };
      
    User.getTimes(timeData, function (err, times) {
        if (err) {
            console.log(err);
            res.send(500, 'Error');
            return;
        } else {
            console.log(times);
            res.send(200, times);
            return;
        }
    });
};

exports.getAsocs = function (req, res, next) {

    if (!req.id) {
        res.send(401, 'Unauthorized');
        return;
    }

    User.getAsocs(req.id, function (err, asocs) {
        if (err) {
            console.log(err);
            res.send(500, 'Error');
            return;
        } else {
            console.log(asocs);
            res.send(200, asocs);
            return;
        }
    });
};

/**
 * Sends a random sample of users/organisms using this website.
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Fcuntion} next: Function that executes next
 * @returns {void} Nothing, but sens in the HTTP response the users as an 
 * Object.
 */
exports.getProfile = function (req, res, next) {

    var idNEO;
    var public = true;

    if (req.params.id) {
        idNEO = parseInt(req.params.id);
        public = !sameUser(idNEO, req, res);
    } else if (req.id) {
        idNEO = req.id;
        public = false;
    } else {
        res.send(401, 'Unauthorized');
        return;
    }

    User.getProfile(idNEO, public, function (err, profile) {
        if (err) {
            console.log(err);
            res.send(500, 'Error getting profile');
            return;
        } else {
            console.log(profile);
            res.send(200, profile);
            return;
        }
    });
};

/**
 * Sends a random sample of users/organisms using this website.
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Fcuntion} next: Function that executes next
 * @returns {void} Nothing, but sens in the HTTP response the users as an 
 * Object.
 */
exports.getThey = function (req, res, next) {
    User.getThey(function (err, users) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        res.send(200, {they: users});
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
    User.getContacts(req.params.id, function (err, user) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        if (user) {
            res.send(200, {results: user});
            return;
        }
        res.send(500, 'Error');
        return;
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
            res.send(500, 'Error');
            return;
        }
        if (contents) {
            //Mongo.getNodeContentsData(req, res, contents);
            res.send(200, contents);
            return;
        }
        res.send(500, 'Error');
        return;
    });

};

/**
 * Sends the ADMIN's parts.
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing.
 */
exports.getAdminNodes = function (req, res, next) {

    if (req.id) {
        ;
    } else {
        res.send(401, 'Unauthorized');
        return;
    }

    User.getAdminNodes(req.id, function (err, nodes) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        if (nodes) {
            res.send(200, nodes);
            return;
        }
        res.send(500, 'Error');
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
            res.send(500, 'Error');
            return;
        }
        if (value) {
            var targetPath = path.resolve(path.join(__dirname, value));
            res.status(200).sendfile(targetPath);
            return;
        }
        res.send(500, 'Error');
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
    res.status(200).sendfile(targetPath);
    return;
};

/**
 * 
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {undefined}
 */
exports.isFriend = function (req, res, next) {
    User.isFriend(req.id, req.params.id, function (err, users) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        res.send(200, {users: users[0]});
        return;
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
    var temp = [];

    if (req.query.hasOwnProperty('fnm'))
        temp.push({label: 'firstName', value: req.query['fnm']});
    if (req.query.hasOwnProperty('lnm'))
        temp.push({label: 'lastName', value: req.query['lnm']});
    if (req.query.hasOwnProperty('prf'))
        temp.push({label: 'profession', value: req.query['prf']});
    if (req.query.hasOwnProperty('ema'))
        temp.push({label: 'email', value: req.query['ema']});
    if (req.query.hasOwnProperty('nam'))
        temp.push({label: 'name', value: req.query['nam']});
    if (req.query.hasOwnProperty('par'))
        temp.push({label: 'parent', value: req.query['par']});

    User.search(req.query.what, temp, req.id, function (err, results) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        res.send(200, results);
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
        res.send(400, 'Missing password');
        return;
    }
    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.send(400, 'Missing email');
        return;
    }

    User.getParamByEmail(nodeData['email'], 'password',function (err, value,id) {
        if (err) {
            console.log(err);
            res.send(401, 'Wrong email or password 1');
            return;
        }

        if(value){}
        else {res.send(401,'aaa');
            return;}

        if (nodeData['hash'] !== value) {
            res.send(401, 'Wrong email or password 2');
            return;
        };
        
        User.changeProperty('active',"1",id, function (sdf){
            if (sdf) {
                res.send(401, 'Something went wrong');
                return;
            }
            //res.redirect(200,'http://localhost:9000/#/profile')
            res.send(200,"Gracias. Recarge la pagina https://127.0.0.1:3000/#/ para iniciar sesion");
            return;
        });
    });
};

/******************************************************************************/
/*                          POST METHODS                                      */
/******************************************************************************/

exports.newActivity = function (req, res, next) {
    var acts = req.body.activities;

    User.newActivity(acts, function (err, result) {
        if (err) {
            res.send(500, 'Error Creating Activities');
            return;
        } else {
            res.send(200, 'OK');
            return;
        }
    });
};

exports.updateProfile = function (req, res, next) {

    if (!sameUser(req.body.id, req, res)) {
        res.send(401, 'Unauthorized');
        return;
    }

    var changes = req.body.changes;
    var idNEO = req.body.id;

    User.updateProfile(idNEO, changes, function (err, profile) {
        if (err) {
            res.send(500, 'Error USERS changeProfile');
            return;
        } else {
            res.send(200, profile);
            return;
        }
    });
};

/**
 * POST /newrel
 */
exports.newRel = function (req, res, next) {
    var relData = req.body;
    if (!relData.hasOwnProperty('inst')) {
        res.send(400, 'Missing Organism');
        return;
    }

    if (!relData.hasOwnProperty('usrID')) {
        res.send(400, 'Missing User');
        return;
    }

    if (!relData.hasOwnProperty('relType')) {
        res.send(400, 'Missing Relationship Details');
        return;
    }

    User.newRel(relData, function (err) {
        if (err) {
            res.send(400, 'Error Creating Rel');
            return;
        } else {
            Mongo.newRel(relData, function (err) {
                if (err) {
                    res.send(500, 'Database Error');
                } else {
                    res.send(200);
                }
            });
        }
    });
};

/**
 * POST /newpart
 */
exports.newPart = function (req, res, next) {
    var data = req.body;
    if (!data.hasOwnProperty('instID')) {
        res.send(400, 'Missing Organism');
        return;
    }

    if (!data.hasOwnProperty('partData')) {
        res.send(400, 'Missing Node Data');
        return;
    }

    if (!data.hasOwnProperty('label')) {
        res.send(400, 'Missing Node Label');
        return;
    }

    User.newPart(data, function (err, partID) {
        if (err) {
            res.send(400, 'Error Creating Node');
            return;
        } else if (partID) {
            /*
             Mongo.register(partID, partData.nodeData, 'Parts', function (err, partID) {
             if (err) {
             console.log(err);
             res.send(500, 'Database error');
             return;
             } else {
             res.send(200, {idNEO: partID});
             return;
             }
             });*/
            res.send(200, {idNEO: partID});
            return;
        } else {
            res.send(500, 'Database error');
            return;
        }
    });
};

/**
 * POST /signup -> SIGN UP
 */
exports.signup = function (req, res, next) {
    var nodeData = req.body;
    if (!nodeData.hasOwnProperty('password') || nodeData['password'] == '') {
        res.send(400, 'Missing password');
        return;
    }

    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.send(400, 'Missing email');
        return;
    }

    var tempPass = hash(nodeData['password'], null);
    nodeData.password = tempPass['pass'];
    nodeData.salt = tempPass['salt'];
    nodeData['active'] = 0;
    var queryData = 'email:"' + nodeData['email'] + '", password:"' +
        tempPass['pass'] + '", salt:"' + tempPass['salt'] +
        '", active:"' + tempPass['active'] + '"';
    // ES NECESARIO VERIFICAR ?
    //if (temp.hasOwnProperty('firstName') && temp['firstName']) query = query + ', firstName:"' + temp['firstName'] + '"';
    //if (temp.hasOwnProperty('lastName') && temp['lastName']) query = query + ', lastName:"' + temp['lastName'] + '"';

    User.signup(nodeData, function (err, idNEO) {
        if (err) {
            res.send(400, 'email taken');
            return;
        } else if (idNEO) {
            if(!sendActivationEmail(nodeData['email'],tempPass['pass'])){
                res.send(400, 'Activation mail error');
                return;
            }
            console.log(idNEO);
            res.send(200, {idNEO: idNEO});
            return;
            /*
             Mongo.register(idNEO, nodeData, 'Users', function (err, userID) {
             if (err) {
             console.log(err);
             res.send(500, 'Database error');
             return;
             } else {
             res.send(200, {idNEO: userID});
             return;
             }
             });
             */
        } else {
            res.send(500, 'Database error');
            return;
        }
    });
};

/**
 * POST /login -> LOG IN
 */
exports.login = function (req, res, next) {

    var nodeData = req.body;
    if (!nodeData.hasOwnProperty('password') || nodeData['password'] == '') {
        res.send(400, 'Missing password');
        return;
    }
    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.send(400, 'Missing email');
        return;
    }

    User.login(nodeData['email'], function (err, results) {
        if (err) {
            res.send(401, 'Wrong email or password');
            return;
        }
        
        console.log(results['active']);
        
        if (results['active']!=="1"){
            res.send(401,'Email not activated')
            return;
        }

        var secPass = hash(nodeData['password'], results['salt']);

        if (secPass['pass'] !== results['pass']) {
            res.send(401, 'Wrong email or password');
        }
        ;
        if (results['idNEO']) {
            if (!loggedIn(req, res)) {
                var cook = new cookies(req, res, keys);
                cook.set('LinkedEnibId', results.idNEO, {signed: true, maxAge: 9000000});
                cook.set('LinkedEnibLang', results.lang, {signed: true, maxAge: 9000000});
                console.log(results['idNEO']);
                res.send(200, {idNEO: results['idNEO'], lang: results.lang});
                return;
            }
            else {
                res.send(401, 'Another user already logged in');
                return;
            }
        }
        res.send(401, 'Wrong email or password');
        return;
    });
};

/**
 * POST /friend -> FRIEND SOMEBODY
 */
exports.friend = function (req, res, next) {
    if (!sameUser(req.body['idUsr'], req, res)) {
        res.send(401, 'Unauthorized');
        return;
    }
    User.friend(req.body['idUsr'], req.body['idFriend'], function (err) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        res.send(200, 'friend');
        return;
    });
};

/**
 * POST /profilepic/:id -> UPLOAD PICTURE
 */
exports.uploadPic = function (req, res, next) {
    var id = req.params.id;
    if (!sameUser(id, req, res)) {
        res.send(401, 'Unauthorized');
        return;
    }
    var tempPath = req.files.image.path;
    var string = 'upload/img' + id + '.jpg';
    var targetPath = path.resolve(path.join(__dirname, string));
    var extension = path.extname(req.files.image.name).toLowerCase();
    if (extension === '.jpeg' || extension === '.png' || extension === '.jpg' || extension === '.bmp') {
        fs.rename(tempPath, targetPath, function (err) {
            if (err) {
                res.send(500, 'Error');
                return;
            }
            User.changeProperty('url', string, id, function (err) {
                if (err) {
                    res.send(500, 'Error');
                    return;
                }
            });
            res.redirect(200, 'http://localhost:9000/#/profile');
            return;
        });
    } else {
        fs.unlink(tempPath, function (err) {
            if (err) {
                res.send(500, 'Error');
                return;
            }
            res.redirect(400, 'http://localhost:9000/#/profile');
            return;
        });
    }
};

/**
 * POST /change -> CHANGE PROPERTY
 */
exports.changeProperty = function (req, res, next) {
    var tmp = req.body;

    if (!sameUser(tmp['id'], req, res)) {
        res.send(401, 'Unauthorized');
        return;
    }
    if (tmp.hasOwnProperty('password')) {
        next();
    }

    //Mongo.changeProfile(req,res);
    /*
     User.changeProperty(tmp['field'],tmp['value'],tmp['id'],function(err){
     if (err){
     res.send(500,'Error');
     return;
     }
     res.send(200,'OK');
     return;
     });
     */
};

exports.verifyPassword = function (req, res, next) {
    User.verifyPassword(req.body['id'], function (err, results) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        var tmp = hash(req.body['password'], results['salt']);
        if (tmp['pass'] !== results['pass']) {
            res.send(401, 'Wrong username or password');
        }
        ;
        next();
        return;
    });
};

exports.changePassword = function (req, res, next) {

    var pswdNew = hash(req.body['new'], null);

    User.changePassword(pswdNew['pass'], pswdNew['salt'], req.body['id'], function (err) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        res.send(200, 'OK');
        return;
    });
};

/******************************************************************************/
/*                          DELETE METHODS                                    */
/******************************************************************************/

/**
 * DELETE /delFriend/:friendId/:userId -> DELETE FRIENDSHIP
 */
exports.deleteFriend = function (req, res, next) {
    if (!sameUser(req.params.userId, req, res)) {
        res.send(401, 'Unauthorized');
        return;
    }
    User.deleteFriend(req.params.userId, req.params.friendId, function (err) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        res.send(200, 'OK');
        return;
    });
};

/**
 * DELETE /delUser/:id -> DELETE USER
 */
exports.deleteUser = function (req, res, next) {
    if (!sameUser(req.params.id, req, res)) {
        res.send(401, 'Unauthorized');
        return;
    }
    User.deleteUser(req.params.id, function (err) {
        if (err) {
            res.send(500, 'Error');
            return;
        }
        return;
    });
};
