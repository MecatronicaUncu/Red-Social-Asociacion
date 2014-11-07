
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
  , key_file = './server.key'
  , cert_file = './server.crt'
  , config = {
    key: fs.readFileSync(key_file),
    cert: fs.readFileSync(cert_file),
    passphrase: passphrase
  }
  , path = require('path')
  , cookies = require('cookies');

var app = express();


/******************************************************************************/
/*                    Cross domain configurations                             */
/******************************************************************************/
var allowCrossDomain = function(req, res, next) {
  //res.header("Access-Control-Allow-Origin", "http://127.0.0.1:9000");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With");
  //res.header("Access-Control-Allow-Headers", "DNT, X-Mx-ReqToken, Keep-Alive, User-Agent, If-Modified-Since, Cache-Control, Origin, X-Requested-With, Content-Type,Accept,Authorization,X-HTTP-Method-Override");
  res.header('Access-Control-Allow-Credentials', true);
  res.header ('Access-Control-Max-Age', 3600);
  next();
};


/******************************************************************************/
/*                    Cookies configuration (NOT USED)                        */
/******************************************************************************/
var csrfValue = function(req) {
  var token = (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
  return token;
};
var cookie2angular = function(req, res, next) {
  res.cookie('XSRF-TOKEN', req.session._csrf);
  next();
};

/******************************************************************************/
/*                       EXPRESS SERVER CONFIG                                */
/******************************************************************************/
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    app.use(express.static(__dirname + '/app'));

    app.use(express.favicon());
    app.use(express.logger('dev'));
    
    app.use(express.bodyParser({keepExtensions: true, uploadDir:path.join(__dirname, 'routes/upload')}));
    
   // app.use(express.methodOverride());
    
    app.use(express.cookieParser("se3vf65dse"));
    //app.use(express.cookieSession());
    //app.use(express.csrf({value: csrfValue}));
    //app.use(cookie2angular);
    
    app.use(express.multipart());

    app.use(allowCrossDomain);

    app.use(app.router);

    app.use(express.static(path.join(__dirname, 'scripts')));
    app.use(express.static(path.join(__dirname, 'routes/upload')));
 
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


/******************************************************************************/
/*                           HTTP REQUESTS                                    */
/******************************************************************************/
app.get('/types', mongo.getTypes);
app.get('/subtypes', mongo.getSubTypes);
app.get('/times',mongo.getTimes);
app.get('/edtconfig',mongo.getConfig);

app.get('/checkCookie',users.extractCookieData,function(req,res){
	
	if(req.id){
		res.send(200, {id:req.id});
	} else {
		res.send(500);
	}
});
app.get('/',function(req,res){
    
    var file = 'index.html';
	var targetPath = path.resolve(path.join(__dirname,file));
	res.status(200).sendfile(targetPath);
});
app.get('/they', users.getThey);
app.get('/search',users.extractCookieData,users.getBy);
app.get('/usr/:id',users.extractCookieData,users.getProfile,users.getUsrProfile);
app.get('/usr/:id/isFriend',users.extractCookieData,users.isFriend);
app.get('/usr/:id/pic',users.getPicture);
app.get('/images/pub/:name',users.getPub);
app.post('/signup', users.signup);
app.post('/login',users.extractCookieData,users.login);
app.post('/friend',users.extractCookieData,users.friend);
app.post('/profilepic/:id',users.extractCookieData,users.uploadPic);
app.post('/change',users.extractCookieData,users.changeProperty,users.changePassword);
app.post('/logout',users.extractCookieData,function (req, res, next) {
    if(req.id){
		res.clearCookie('LinkedEnibId');
	}
    res.send(200);
});
app.post('/delFriend/:friendId/:userId',users.extractCookieData,users.deleteFriend);
app.post('/delUser/:id',users.extractCookieData,users.deleteUser,function (req,res,next){
	if(req.id){
		res.clearCookie('LinkedEnibId');
	}
	res.send(200);
});
app.get('/*',function(req,res){
	var targetPath = path.resolve(path.join(__dirname,req.url));
	var tgt = true;
	for(var prop in req.query) {
		if(req.query.hasOwnProperty(prop)){
			tgt = false;
			targetPath = targetPath.split('?');
	                res.status(200).sendfile(targetPath[0]);     
		}
	}
	if (tgt){
		res.status(200).sendfile(targetPath);
	}
});

/******************************************************************************/
/*                           START SERVER                                     */
/******************************************************************************/
//http.createServer(app).listen(app.get('port'), function(){
//  console.log("Express server listening on port " + app.get('port'));
//});

https.createServer(config,app).listen(app.get('port'), function(){
  console.log("Express HTTPS server listening on port " + app.get('port'));
});