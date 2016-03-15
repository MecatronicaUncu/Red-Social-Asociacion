
/******************************************************************************/
/*                           Module dependencies                              */
/******************************************************************************/
var express = require('express')
    , users = require('./routes/users.js')
    , mongo = require('./routes/mongo.js')
    , fs = require('fs')
    , http = require('http')
    , https = require('https')
    , passphrase = 'mecuncu'
    , key_file = './server/Red-Social-Asociacion.key'
    , cert_file = './server/Red-Social-Asociacion.crt'
    , config = {
        key: fs.readFileSync(key_file),
        cert: fs.readFileSync(cert_file),
        passphrase: passphrase
    }
    , path = require('path')
    , cookies = require('cookies')
    , cluster = require('cluster')
    , domain = require('domain')
    , numCPU = require('os').cpus().length
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , bodyParser = require('body-parser')
    , multer = require('multer')
    //, upload = multer({dest: path.join(__dirname, 'routes/upload')})
    , cookieParser = require('cookie-parser')
    , serveStatic = require('serve-static')
    , errorHandler = require('errorhandler')
    , cors = require('cors');

var app = express();


/******************************************************************************/
/*                    CORS Whitelist & Options                                */
/******************************************************************************/
var whiteList=['https://127.0.0.1:3000', 'https://localhost:3000'];
var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whiteList.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true,
  methods: ['GET', 'POST', /*'PUT', 'DELETE',*/ 'OPTIONS'],
  //allowedHeaders: 
  maxAge: 3600
};


/******************************************************************************/
/*                    Cookies configuration (NOT USED)                        */
/******************************************************************************/
var csrfValue = function (req) {
    var token = (req.body && req.body._csrf)
        || (req.query && req.query._csrf)
        || (req.headers['x-csrf-token'])
        || (req.headers['x-xsrf-token']);
    return token;
};
var cookie2angular = function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.session._csrf);
    next();
};

/******************************************************************************/
/*                       EXPRESS SERVER CONFIG                                */
/******************************************************************************/

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

// Node.js middleware for serving a favicon. 
//app.use(favicon(__dirname + '/public/favicon.ico'));

// HTTP request logger middleware for node.js
app.use(logger('dev'));

// Node.js body parsing middleware.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Parse Cookie header and populate req.cookies with an object keyed by the cookie names. 
app.use(cookieParser("se3vf65dse"));

//app.use(csrf({value: csrfValue}));
//app.use(cookie2angular);

// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. 
app.use(multer({dest: path.join(__dirname, 'routes/upload')}).single('image'));

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../build/src/app')));
app.use(express.static(path.join(__dirname, '../build')));
app.use(express.static(path.join(__dirname, 'routes/upload')));


if('development' == app.get('env')){
    app.use(errorHandler());
}

/******************************************************************************/
/*                           HTTP REQUESTS                                    */
/******************************************************************************/

/****************************    EDT REQUESTS   *******************************/
app.get('/acttypes', mongo.getTypes);
app.get('/times', users.getTimes);
app.get('/edtconfig', users.getEdtConfig);
app.get('/edtplaces', mongo.getPlaces);
app.get('/getTimesIcal', users.getTimesIcal);
app.get('/subscriptions', users.extractCookieData, users.getSubscriptions);
app.post('/edtnewact', users.newActivity);
/******************************************************************************/

/****************************   COOKIES REQUESTS   ****************************/
app.get('/checkCookie', users.extractCookieData, function (req, res) {

    if (req.id) {
        res.status(200).send({idNEO: req.id, lang: req.lang});
    } else {
        res.sendStatus(500);
    }
});
app.get('/checkAdminCookie', users.extractCookieData, function (req, res) {

    if (req.id) {
        users.isAdmin(req.id, function (is) {
            if (is)
                res.status(200).send({idNEO: req.id, lang: req.lang});
            else
                res.sendStatus(500);
        });
    } else {
        res.sendStatus(500);
    }
});
/******************************************************************************/

/**************************  ALL USERS' REQUESTS   ****************************/
app.get('/search', users.extractCookieData, users.search);
app.get('/usr/:id/pic', users.getPicture);
app.get('/profile/:id', users.extractCookieData, users.getProfile);
app.get('/translation/:lang', users.getTranslation);
app.get('/they', users.getThey);
app.get('/activate', users.activate);
app.post('/signup', users.signup);
app.post('/login', users.extractCookieData, users.login);
/******************************************************************************/

/**************************  LOGGED USERS' REQUESTS   *************************/
app.get('/contacts', users.extractCookieData, users.getContacts);
app.get('/profile', users.extractCookieData, users.getProfile);
app.get('/fields/:label', mongo.getFields);
app.get('/asocs', users.extractCookieData, users.getAsocs);
app.get('/usr/:id/isFriend', users.extractCookieData, users.isFriend);
app.post('/profilepic/:id', users.extractCookieData, users.uploadPic);
app.post('/friend', users.extractCookieData, users.friend);
app.post('/delFriend', users.extractCookieData, users.deleteFriend);
app.post('/subscribe', users.extractCookieData, users.subscribe);
app.post('/unsubscribe', users.extractCookieData, users.unsubscribe);
app.post('/delUser/:id', users.extractCookieData, users.deleteUser, function (req, res, next) {
    if (req.id) {
        res.clearCookie('LinkedEnibId');
    }
    res.sendStatus(200);
});
app.post('/logout', users.extractCookieData, function (req, res, next) {
    if (req.id) {
        res.clearCookie('LinkedEnibId');
    }
    res.sendStatus(200);
});
app.post('/change', users.extractCookieData, users.changeProperty, users.verifyPassword, users.changePassword);
app.post('/uptprofile', users.extractCookieData, users.updateProfile);
/******************************************************************************/

/****************************  ADMINS' REQUESTS   *****************************/
app.get('/nodereltypes', users.extractCookieData, mongo.getNodeRelTypes);
app.get('/nodecontents', users.extractCookieData, users.getNodeContents);
app.get('/adminnodes', users.extractCookieData, users.getAdminNodes);
app.post('/newpart', users.extractCookieData, users.newPart);
app.post('/newrel', users.extractCookieData, users.newRel);
/******************************************************************************/

/****************************  GENERAL REQUESTS   *****************************/
app.get('/', function (req, res) {

    var file = '../build/index.html';
    var targetPath = path.resolve(path.join(__dirname, file));
    res.status(200).sendFile(targetPath);
});

app.get('/images/pub/:name', users.getPub);
/******************************************************************************/

/******************************************************************************/
/*                           START SERVER                                     */
/******************************************************************************/
//http.createServer(app).listen(app.get('port'), function(){
//  console.log("Express server listening on port " + app.get('port'));
//});

//https.createServer(config, app).listen(app.get('port'), function () {
//    console.log("Express HTTPS server listening on port " + app.get('port'));
//});


if (cluster.isMaster) {
  // Si el proceso es el proceso maestro se crean los procesos worker
  for (var i = 0; i < numCPU; i++) {
    cluster.fork();
  }

  cluster.on('disconnect', function(worker) {
    console.log('worker ' + worker.process.pid + ' died');
    cluster.fork();
  }); 

} else {
  var server = https.createServer(config, app, function(request, response) {
    var d = domain.create();
    d.on('error', function(err) {
      console.log(err.stack);

      try {
        // Ten minutes to let other connections finish:
        var killTimer = setTimeout(function() {
          process.exit(1);
        }, 30000);
        killTimer.unref(); // Don't stay up just for the timer
        server.close(); // stop taking new requests.
        cluster.worker.disconnect(); // Let the master know we're dead.
        // try to send an error to the request that triggered the problem
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Oops, there was a problem!\n');
      } catch (err2) {
        console.log("Error handling error!: " + err2);
      } 
    });

    d.add(request);  // Explicit binding
    d.add(response); // Explicit binding

    d.run(function() {
      handleRequest(req, res);
    });
  }).listen(app.get('port'), function () {
    console.log("Express HTTPS server listening on port " + app.get('port'));
    });
} 

// You'd put your fancy application logic here.
function handleRequest(req, res) {
  switch(req.url) {
    case '/error':
      // We do some async stuff, and then...
      setTimeout(function() {
        // Whoops!
        flerb.bark();
      });
      break;
    default:
      res.end('ok');
  }
}
