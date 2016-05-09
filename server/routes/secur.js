var Secur = require('./_secur.js');
var cookies = require('cookies');
var crypto = require('crypto');
var keygrip = require('keygrip');
var keys = keygrip(["Andres", "Franco"]);

// TODO : verify all methods, and security issues with cookies

/******************************************************************************/
/*                          COOKIES & SECURITY                                */
/******************************************************************************/

exports.cookKeys = keys;

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
exports.hash = hash;

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
exports.loggedIn = loggedIn;

/**
 * Checks if the user doing the request is administrator.
 * @param {Integer} id: The user's ID
 * @param {Function} next: Function that executes next
 * @returns {callback} Runs next function.
 */
var isAdmin = function (id, next) {

    Secur.isAdmin(id, function (err,is) {
		if (err)
			return next(false);
        else if (is)
            return next(true);
        else
            return next(false);
    });
};
exports.isAdmin = isAdmin;

/**
 * TODO : verificar esta función
 * Extracts the cookies from the HTTP request header
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {callback} Runs next function.
 */
exports.extractCookieData = function (req, res, next) {

    var cook = new cookies(req, res, keys);
    var idCookie = cook.get('RedSocialAsociacionID');
    var langCookie = cook.get('RedSocialAsociacionLANG');

    if (idCookie) {
        req.id = parseInt(idCookie);
    }
    else {
        console.log('Cookies Errors');
    }
    if (langCookie) {
      req.lang = langCookie;
    }else{
      req.lang = 'es';
    }

    return next();
};

/**
 * TODO : Comment on functionality
 */
exports.verifyPassword = function (req, res, next) {

    Secur.verifyPassword(req.body['id'], function (err, results) {
        if (err) {
            res.status(500).send(err);
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
