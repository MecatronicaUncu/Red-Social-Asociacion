
/******************************************************************************/
/*                           Module dependencies                              */
/******************************************************************************/
var express = require('express')
    , users = require('./routes/users.js')
    , edt = require('./routes/edt.js')
    , admin = require('./routes/admin.js')
    , secur = require('./routes/secur.js')
    , path = require('path')
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
app.use(express.static(path.join(__dirname, '../build/src/icons')));


if('development' == app.get('env')){
    app.use(errorHandler());
}

/******************************************************************************/
/*                           HTTP REQUESTS                                    */
/******************************************************************************/

/****************************    EDT REQUESTS   *******************************/
app.get('/acttypes', secur.extractCookieData, edt.getActivityTypes);
app.get('/times', edt.getTimes);
app.get('/edtconfig', edt.getEdtConfig);
app.get('/edtplaces', edt.getPlaces);
app.get('/getTimesIcal', edt.getTimesIcal);
app.get('/subscriptions', secur.extractCookieData, users.getSubscriptions);
app.post('/edtnewact', secur.extractCookieData, edt.newActivity);
/******************************************************************************/

/****************************   COOKIES REQUESTS   ****************************/
app.get('/checkCookie', secur.extractCookieData, function (req, res) {

    if (req.id) {
        secur.isAdmin(req.id, function (is) {
            if (is)
                res.status(200).send({idNEO: req.id, lang: req.lang, admin: true});
            else
                res.status(200).send({idNEO: req.id, lang: req.lang, admin: false});
        });
    } else {
        res.sendStatus(500);
    }
});
/******************************************************************************/

/**************************  ALL USERS' REQUESTS   ****************************/
app.get('/search', secur.extractCookieData, users.search);
app.get('/usr/:id/pic', users.getPicture);
app.get('/profile/:id', secur.extractCookieData, users.getProfile);
app.get('/translation/:lang', users.getTranslation);
app.get('/they', users.getThey);
app.get('/activate', users.activate);
app.post('/signup', users.signup);
app.get('/nodecontents', users.getNodeContents);
app.post('/login', secur.extractCookieData, users.login);
/******************************************************************************/

/**************************  LOGGED USERS' REQUESTS   *************************/
app.get('/contacts', secur.extractCookieData, users.getContacts);
app.get('/profile', secur.extractCookieData, users.getProfile);
app.get('/asocs', secur.extractCookieData, users.getAsocs);
app.get('/usr/:id/isFriend', secur.extractCookieData, users.isFriend);
app.post('/profilepic/:id', secur.extractCookieData, users.uploadPic);
app.post('/friend', secur.extractCookieData, users.friend);
app.post('/delFriend', secur.extractCookieData, users.deleteFriend);
app.post('/subscribe', secur.extractCookieData, users.subscribe);
app.post('/unsubscribe', secur.extractCookieData, users.unsubscribe);
app.post('/delUser/:id', secur.extractCookieData, users.deleteUser, function (req, res, next) {
    if (req.id) {
        res.clearCookie('LinkedEnibId');
    }
    res.sendStatus(200);
});
app.post('/logout', secur.extractCookieData, function (req, res, next) {
    if (req.id) {
        res.clearCookie('LinkedEnibId');
    }
    res.sendStatus(200);
});
app.post('/change', secur.extractCookieData, users.changeProperty, secur.verifyPassword, users.changePassword);
app.post('/uptprofile', secur.extractCookieData, users.updateProfile);
/******************************************************************************/

/****************************  ADMINS' REQUESTS   *****************************/
app.get('/nodereltypes', secur.extractCookieData, admin.getNodeRelTypes);
app.get('/fields/:label', secur.extractCookieData, admin.getNodeRelFields);
app.get('/adminnodes', secur.extractCookieData, admin.getAdminNodes);
app.post('/newpart', secur.extractCookieData, admin.newPart);
app.post('/newrel', secur.extractCookieData, admin.newRel);
app.post('/delnoderel', secur.extractCookieData, admin.delNodeRel);
/******************************************************************************/

/****************************  GENERAL REQUESTS   *****************************/
app.get('/', function (req, res) {

    var file = '../build/index.html';
    var targetPath = path.resolve(path.join(__dirname, file));
    res.status(200).sendFile(targetPath);
});

app.get('/images/pub/:name', users.getPub);
/******************************************************************************/

module.exports = app;
