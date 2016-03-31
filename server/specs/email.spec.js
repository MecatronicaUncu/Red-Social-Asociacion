"use strict"

var rewire = require("rewire");

describe("Email functionalities", function(){
	var users;
	var secur;
	
	beforeEach(function() {
        users = rewire("../routes/users.js");
        secur = rewire("../routes/secur.js");
    });
    
    describe ("Send mail", function(){
		var ret = false;
		
		beforeEach(function(done) {
			var pass = secur.hash("testPass",null);
			users.sendActivationEmail("---@gmail.com",pass['pass'],"---","---", 
				function (result) {
					ret = result;
					done();
				});
		});
		
		it("Should send email", function() {
			expect(ret).toBe(true);
		});
	});

});
