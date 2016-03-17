// users.js
// Routes to CRUD users.

var User = require('./user.js');
var Mongo = require('./mongo.js');
var path = require('path');
var cookies = require('cookies');
var keygrip = require('keygrip');
var VCalendar = require('cozy-ical').VCalendar;
var VEvent = require('cozy-ical').VEvent;
var keys = keygrip(["Andres", "Franco"]);
exports.CookKeys = keys;
var fs = require('fs'); //FILESYSTEM
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;
var domain="https://127.0.1.1:3000";

/******************************************************************************/
/*                          LOAD TRANSLATIONS                                 */
/******************************************************************************/
var translations;

var transFile = path.resolve(path.join(__dirname, '../config/translations.json'));
    
fs.readFile(transFile, 'utf-8', function (err, t) {
    if (err){
        throw err;
    }
    else{
        translations = JSON.parse(t);
    }
});  

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

/**
* Toma un string de formato 'XXhXX' (donde X es un dígito [0-9]) y devuelve
* horas y minutos.
* @param  {String} t
* @return {Array} [hora,minutos]
*/
var getminutes = function (t) {
   var mt = t.split('h');
   return [parseInt(mt[0]), parseInt(mt[1])];
};

/**
* Convierte un array de tipo [Year, Week, DayOfWeek] (ISO 8601) en un objeto de
* tipo Date
* @param {Array} AYWD ([Year, Week, DayOfWeek])
* @return {Date Object} Dob
*/
var YWDarrToDob = function (AYWD) { // Arg : ISO 8601 : [Y, W, D]
   var DOb = new Date(+AYWD[0], 0, 3);  // Jan 3
   if (isNaN(DOb))
       return false;
   DOb.setDate(3 - DOb.getDay() + (AYWD[1] - 1) * 7 + +AYWD[2]);
   return DOb;
};

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

    if (idCookie) {

        req.id = parseInt(idCookie);
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
var sendActivationEmail = function(email,hash,name,lastname){
	
	var templatesDir = path.resolve(path.join(__dirname, '../templates/email_activacion/'));
	var emailTemplate = new EmailTemplate(templatesDir);
	
	// Prepare nodemailer transport object
	var transport = nodemailer.createTransport({
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
	  link: domain+'/activate?email='+email+'&hash='+hashRep,
	  name: name,
	  lastname: lastname
	};
	
	// Send a single email
	emailTemplate.render(locals, function (err, results) {
	  if (err) {
		console.error(err);
		return;
	  }

	  transport.sendMail({
		from: 'Admin <admin@admin.com>',
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
		  console.error(err)
		  return;
		}
		console.log(responseStatus.message);
		return;
	  })
  })
};

/******************************************************************************/
/*                          GET METHODS                                       */
/******************************************************************************/

exports.getTranslation = function(req,res,next){
    
    var lang = req.params.lang;
    if(!lang){
        res.status(500).send('Error');
    }else if(translations.hasOwnProperty(lang)){
        res.status(200).send({translation: translations[lang]});
    }else{
        res.status(404).send('translation for:'+lang+'not found');
    }

};

exports.getEdtConfig = function(req, res, next){
    
    //TODO: Configuracion personal del usuario
    
    var configFile = path.resolve(path.join(__dirname, '../config/edtConfig.json'));
    
    fs.readFile(configFile, 'utf-8', function (err, config) {
        if (err){
            console.log(err);
            res.sendStatus(500);
        }
        else{
            console.log(config);
            res.status(200).send(config);
        }
    });  
};

exports.getTimesIcal = function(req, res, next){
    
    if( req.query.whatId && req.query.whoId && 
        req.query.week && req.query.year && req.query.whatName)
        ;
    else{
        res.status(401).send('Missing information');
        return;
    }
    
    var timeData = {
        //TODO: Extender a array de whats
        whatName: req.query.whatName,
        //whoName: req.query.whoName,
        whatId: req.query.whatId,
        whoId: req.query.whoId,
        week: req.query.week,
        year: req.query.year,
    };
      
    User.getTimes(timeData, function (err, times) {
        if (err) {
            console.log(err);
            res.status(500).send('Error');
            return;
        } else {
            console.log(times);
            var cal = new VCalendar({
                organization: 'TimesApp',
                title: timeData.whatName
            });
            var tmpDate,tmpHMin,startDate,endDate;
            times.forEach(function(time){
                tmpDate = YWDarrToDob([time.year,time.week,time.day])
                tmpHMin = getminutes(time.from);
                startDate = new Date(   tmpDate.getFullYear(), 
                                        tmpDate.getMonth(),
                                        tmpDate.getDate(),
                                        tmpHMin[0]+Math.floor(time.timezone/60), tmpHMin[1]+time.timezone%60, 0);
                tmpHMin = getminutes(time.to);                        
                endDate = new Date(     tmpDate.getFullYear(), 
                                        tmpDate.getMonth(),
                                        tmpDate.getDate(),
                                        tmpHMin[0]+Math.floor(time.timezone/60), tmpHMin[1]+time.timezone%60, 0);
                                        
                var vevent = new VEvent({
                    stampDate: 0,
                    startDate: startDate,
                    endDate: endDate,
                    summary: time.type,
                    description: time.desc,
                    //location: "Test Location",
                    uid: time.idNEO
                });

                cal.add(vevent);
            });

            console.log(cal.toString());

            fs.writeFile("/tmp/ical.ics", cal.toString(), function(err) {
                if(err) {
                    return console.log(err);
                    res.sendStatus(500);
                }else{
                    var stat = fs.statSync('/tmp/ical.ics');
                    res.writeHead(200, {
                          'Content-Type': 'text/calendar', 
                          'Content-Length': stat.size,
                          'Content-disposition' : 'attachment; filename="calendar.ics"'
                    });
                    var stream = fs.createReadStream( '/tmp/ical.ics', { bufferSize: 64 * 1024 });
                    //res.attachment('/tmp/ical.ics');
                    stream.pipe(res);
        //            res.download('/tmp/ical.ics','calendar.ics');
                }
            }); 
        }
    });
};

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
            res.status(500).send('Error');
            return;
        } else {
            console.log(times);
            res.status(200).send(times);
            return;
        }
    });
};

exports.getAsocs = function (req, res, next) {

    if (!req.id) {
        res.status(401).send('Unauthorized');
        return;
    }

    User.getAsocs(req.id, function (err, asocs) {
        if (err) {
            console.log(err);
            res.status(500).send('Error');
            return;
        } else {
            console.log(asocs);
            res.status(200).send(asocs);
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
        res.status(401).send('Unauthorized');
        return;
    }

    User.getProfile(idNEO, public, function (err, profile) {
        if (err) {
            console.log(err);
            res.status(500).send('Error getting profile');
            return;
        } else {
            console.log(profile);
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
 * @returns {void} Nothing, but sens in the HTTP response the users as an 
 * Object.
 */
exports.getThey = function (req, res, next) {
    User.getThey(function (err, users) {
        if (err) {
            res.status(500).send('Error');
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
    
    if(req.id){
        ;
    }else{
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.getContacts(req.id, function (err, contacts) {
        if (err) {
            res.status(500).send('Error');
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
            res.status(500).send('Error');
            return;
        }
        if (contents) {
            //Mongo.getNodeContentsData(req, res, contents);
            res.status(200).send(contents);
            return;
        }
        res.status(500).send('Error');
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
        res.status(401).send('Unauthorized');
        return;
    }

    User.getAdminNodes(req.id, function (err, nodes) {
        if (err) {
            res.status(500).send('Error');
            return;
        }
        if (nodes) {
            res.status(200).send(nodes);
            return;
        }
        res.status(500).send('Error');
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
            res.status(500).send('Error');
            return;
        }
        if (value) {
            var targetPath = path.resolve(path.join(__dirname, value));
            res.status(200).sendFile(targetPath);
            return;
        }
        res.status(500).send('Error');
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
 * 
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {undefined}
 */
exports.isFriend = function (req, res, next) {
    User.isFriend(req.id, req.params.id, function (err, users) {
        if (err) {
            res.status(500).send('Error');
            return;
        }
        res.status(200).send({users: users[0]});
        return;
    });
};

exports.getSubscriptions = function (req, res, next){
    
    if (req.id) {
        ;
    } else {
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.getSubscriptions(req.id, function(err, subsc){
        if(err){
            console.log(err);
            res.status(500).send('ERROR');
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

    if(req.id){
        ;
    }else{
        req.id = 0;
    }

    User.search(req.query.what, req.query.term, req.id, function (err, results) {
        if (err) {
            res.status(500).send('Error');
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
            console.log(err);
            res.status(401).send('Wrong email or password 1');
            return;
        }

        if(value){}
        else {res.status(401).send('aaa');
            return;}

        if (nodeData['hash'] !== value) {
            res.status(401).send('Wrong email or password 2');
            return;
        };
        
        User.activate(id, function (sdf){
            if (sdf) {
                res.status(401).send('Something went wrong');
                return;
            }
            res.status(200).send('<html><head><meta http-equiv="refresh" content="3;url='+domain+'" /></head><body><h1>Su cuenta ha sido activada. Redireccionando en 3 segundos...</h1></body></html>');
            return;
        });
    });
};

/******************************************************************************/
/*                          POST METHODS                                      */
/******************************************************************************/
exports.unsubscribe = function(req, res, next){
    
    if (req.id && req.body.instId){
        ;
    }else{
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.unsubscribe(req.id, req.body.instId, function(err){
        if(err){
            console.log(err);
            res.status(500).send('ERROR');
        }else{
            res.status(200).send('OK');
        }
    });
};

exports.subscribe = function(req, res, next){
    
    if (req.id && req.body.instId){
        ;
    }else{
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.subscribe(req.id, req.body.instId, function(err){
        if(err){
            console.log(err);
            res.status(500).send('ERROR');
        }else{
            res.status(200).send('OK');
        }
    });
};

exports.newActivity = function (req, res, next) {
    var acts = req.body.activities;

    User.newActivity(acts, function (err, result) {
        if (err) {
            res.status(500).send('Error Creating Activities');
            return;
        } else {
            res.status(200).send('OK');
            return;
        }
    });
};

exports.updateProfile = function (req, res, next) {

    if (!sameUser(req.body.id, req, res)) {
        res.status(401).send('Unauthorized');
        return;
    }

    var changes = req.body.changes;
    var idNEO = req.body.id;

    User.updateProfile(idNEO, changes, function (err, profile) {
        if (err) {
            res.status(500).send('Error USERS changeProfile');
            return;
        } else {
            res.status(200).send(profile);
            return;
        }
    });
};

/**
 * POST /newrel
 */
exports.newRel = function (req, res, next) {
    var relData = req.body;
    if (!relData.hasOwnProperty('instId')) {
        res.status(400).send('Missing Organism');
        return;
    }

    if (!relData.hasOwnProperty('usrID')) {
        res.status(400).send('Missing User');
        return;
    }

    if (!relData.hasOwnProperty('relType')) {
        res.status(400).send('Missing Relationship Details');
        return;
    }
    console.log(relData);
    User.newRel(relData, function (err) {
        if (err) {
            res.status(400).send('Error Creating Rel');
            return;
        } else {
            res.status(200).send('OK');
        }
    });
};

/**
 * POST /newpart
 */
exports.newPart = function (req, res, next) {
    var data = req.body;
    if (!data.hasOwnProperty('instID')) {
        res.status(400).send('Missing Organism');
        return;
    }

    if (!data.hasOwnProperty('partData')) {
        res.status(400).send('Missing Node Data');
        return;
    }

    if (!data.hasOwnProperty('label')) {
        res.status(400).send('Missing Node Label');
        return;
    }

    User.newPart(data, function (err, partID) {
        if (err) {
            res.status(400).send('Error Creating Node');
            return;
        } else if (partID) {
            res.status(200).send({idNEO: partID});
            return;
        } else {
            res.status(500).send('Database error');
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
        res.status(400).send('Missing password');
        return;
    }

    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.status(400).send('Missing email');
        return;
    }
    
    var email = nodeData.email;
    var tempPass = hash(nodeData['password'], null);
    nodeData.password = tempPass['pass'];
    nodeData.salt = tempPass['salt'];
    //nodeData['active'] = 0;
    // ES NECESARIO VERIFICAR ?
    //if (temp.hasOwnProperty('firstName') && temp['firstName']) query = query + ', firstName:"' + temp['firstName'] + '"';
    //if (temp.hasOwnProperty('lastName') && temp['lastName']) query = query + ', lastName:"' + temp['lastName'] + '"';

    User.signup(nodeData, function (err, idNEO) {
        if (err) {
            res.status(400).send('email taken');
            return;
        } else if (idNEO) {
			sendActivationEmail(email,tempPass['pass'],nodeData['firstName'],nodeData['lastName']);
			res.status(200).send({idNEO: idNEO});
			return;
        } else {
            res.status(500).send('Database error');
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
        res.status(400).send('Missing password');
        return;
    }
    if (!nodeData.hasOwnProperty('email') || nodeData['email'] == '') {
        res.status(400).send('Missing email');
        return;
    }

    User.login(nodeData['email'], function (err, results) {
		
        if (err) {
            res.status(401).send('Wrong email or password');
            return;
        }
        
        console.log(results['active']);
        
        if (results['active']!==1){
            res.status(401).send('Email not activated')
            return;
        }

        var secPass = hash(nodeData['password'], results['salt']);

        if (secPass['pass'] !== results['pass']) {
            res.status(401).send('Wrong email or password');
            return;
        }
        ;
        if (results['idNEO']) {
            if (!loggedIn(req, res)) {
                var cook = new cookies(req, res, keys);
                cook.set('LinkedEnibId', results.idNEO, {signed: true, maxAge: 9000000});
                console.log(results['idNEO']);
                res.status(200).send({idNEO: results['idNEO'], lang: results.lang});
                return;
            }
            else {
                res.status(401).send('Another user already logged in');
                return;
            }
        }
        res.status(401).send('Wrong email or password');
        return;
    });
};

/**
 * POST /friend -> FRIEND SOMEBODY
 */
exports.friend = function (req, res, next) {
    
    if (req.id && req.body.idFriend && (req.body.idFriend != req.id)) {
        ;
    }else{
        res.status(401).send('Unauthorized');
        return;
    }

    User.friend(req.id, req.body['idFriend'], function (err) {
        if (err) {
            res.status(500).send('Error');
            return;
        }
        res.status(200).send('friend');
        return;
    });
};

/**
 * POST /profilepic/:id -> UPLOAD PICTURE
 */
exports.uploadPic = function (req, res, next) {
    var id = req.params.id;
    if (!sameUser(id, req, res)) {
        res.status(401).send('Unauthorized');
        return;
    }
    console.log (req);
    console.log(req.file);
    var tempPath = req.file.path;
    var string = 'upload/img' + id + '.jpg';
    var targetPath = path.resolve(path.join(__dirname, string));
    var extension = path.extname(req.file.originalname).toLowerCase();
    if (extension === '.jpeg' || extension === '.png' || extension === '.jpg' || extension === '.bmp') {
        fs.rename(tempPath, targetPath, function (err) {
            if (err) {
                res.status(500).send('Error');
                return;
            }
            User.changeProperty('url', string, id, function (err) {
                if (err) {
                    res.status(500).send('Error');
                    return;
                }
            });
            res.redirect(200, 'http://localhost:9000/#/profile');
            return;
        });
    } else {
        fs.unlink(tempPath, function (err) {
            if (err) {
                res.status(500).send('Error');
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

    if (tmp.hasOwnProperty('password')) {
        next();
        return;
    }

    if(req.id && tmp.field && tmp.value)
        ;
    else
    {
        res.sendStatus(401);
        return;
    }
    
    User.changeProperty(tmp.field, tmp.value, req.id, function(err){
        if(err){
            console.log(err);
            res.sendStatus(500);
        }else{
            res.sendStatus(200);
        }
    });
};

exports.verifyPassword = function (req, res, next) {
    
    User.verifyPassword(req.body['id'], function (err, results) {
        if (err) {
            res.status(500).send('Error');
            return;
        }else{
            var tmp = hash(req.body['password'], results['salt']);
            if (tmp['pass'] !== results['pass']) {
                res.status(401).send('Wrong username or password');
                return;
            }else{
                next();
                return;
            }
        }
    });
};

exports.changePassword = function (req, res, next) {

    var pswdNew = hash(req.body['new'], null);

    User.changePassword(pswdNew['pass'], pswdNew['salt'], req.body['id'], function (err) {
        if (err) {
            res.status(500).send('Error');
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
 * DELETE /delFriend -> DELETE FRIENDSHIP
 */
exports.deleteFriend = function (req, res, next) {
    
    if (req.id && req.body.idFriend && (req.body.idFriend != req.id)) {
        ;
    }else{
        res.status(401).send('Unauthorized');
        return;
    }
    
    User.deleteFriend(req.id, req.body.idFriend, function (err) {
        if (err) {
            res.status(500).send('Error');
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
    if (!sameUser(req.params.id, req, res)) {
        res.status(401).send('Unauthorized');
        return;
    }
    User.deleteUser(req.params.id, function (err) {
        if (err) {
            res.status(500).send('Error');
            return;
        }
        return;
    });
};
