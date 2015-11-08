var csv = require("fast-csv");
var crypto = require('crypto');
var fs = require('fs'); //FILESYSTEM

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

/******************************************************************************/
/*                          PASSWORDS  AND PICTURE                            */
/******************************************************************************/
var i=0;
csv
   .fromPath("people_email_pass.csv", {headers: true})
   .transform(function(nodeData){
        var email = nodeData.email;
        var tempPass = hash(nodeData['password'], null);
        nodeData.password = tempPass['pass'];
        nodeData.salt = tempPass['salt'];
        nodeData.url = 'upload/img'+(i++)+'.png';
        nodeData.lang = 'ar';
        return nodeData;
   })
   .pipe(csv.createWriteStream({headers: true}))
   .pipe(fs.createWriteStream("people_email_pass_salt.csv", {encoding: "utf8"}));