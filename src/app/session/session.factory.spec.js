(function(){
	
	"use strict";

	var defaultTrans = { translation: 'default'};

	ngDescribe({
		name: 'Session factory',
		module: 'linkedEnibApp',
		inject: ['session', '$httpBackend'],
		tests: function(deps){

			describe('API', function(){

				it('Methods existance',function(){
					expect(typeof deps.session.getID).toBe('function');
					expect(typeof deps.session.getLang).toBe('function');
					expect(typeof deps.session.getProfile).toBe('function');
					expect(typeof deps.session.getTranslation).toBe('function');
					expect(typeof deps.session.getSubscriptions).toBe('function');
					expect(typeof deps.session.getContacts).toBe('function');

					expect(typeof deps.session.login).toBe('function');
					expect(typeof deps.session.logout).toBe('function');
					expect(typeof deps.session.updateProfile).toBe('function');
					expect(typeof deps.session.updateContacts).toBe('function');
					expect(typeof deps.session.updateSubscriptions).toBe('function');
					expect(typeof deps.session.updateTranslation).toBe('function');

					expect(typeof deps.session.isAdmin).toBe('function');
					expect(typeof deps.session.isLoggedIn).toBe('function');
			});

				it('Factory defaults',function(){

					expect(deps.session.getID()).toEqual(0);
					expect(deps.session.getLang()).toBe('es');
					expect(deps.session.getProfile()).toBe(null);
					expect(deps.session.getTranslation()).toBe(null);
					expect(deps.session.getSubscriptions()).toBe(null);
					expect(deps.session.getContacts()).toBe(null);

					expect(deps.session.isAdmin()).toBe(false);
					expect(deps.session.isLoggedIn()).toBe(false);
				});
			});

			describe('Login and logout events',function(){

				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');

					deps.http.flush();

					spyOn(deps.$rootScope,'$broadcast');
				});

				it('Should fire the correct event upon correct login',function(){
					deps.$httpBackend.expectPOST('/login').respond(200, { idNEO: 13, lang: 'es', admin:false});
					deps.session.login();

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('logout',null);
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('logout',jasmine.anything());
				});

				it('Should fire the correct event upon incorrect login',function(){
					deps.$httpBackend.expectPOST('/login').respond(500, 'Error');
					deps.session.login();

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',jasmine.any(String));
				});

				it('Should fire the correct event upon incorrect login - 2',function(){
					deps.$httpBackend.expectPOST('/login').respond(200);
					deps.session.login();

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',jasmine.any(String));
				});

				it('Should fire the correct event upon correct logout',function(){
					deps.$httpBackend.expectPOST('/login').respond(200, { idNEO: 13, lang: 'es', admin: false});
					deps.session.login();

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('login',jasmine.any(String));

					deps.$httpBackend.expectPOST('/logout').respond(200);
					deps.session.logout();

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('logout',null);
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('logout',jasmine.any(String));
				});

				it('Should fire the correct event upon incorrect logout',function(){
					deps.session.logout();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('login',jasmine.any(String));
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('logout',null);
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('logout',jasmine.any(String));
				});
			});

			describe('Update functions events',function(){
				
				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');
					deps.http.flush();
					spyOn(deps.$rootScope,'$broadcast');
				});

				it('Should fire the correct event upon profile update',function(){
					deps.$httpBackend.expectGET(/.*\/profile\/[0-9]+/).respond(200, {});
					deps.session.updateProfile();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotProfile',jasmine.any(Object));

					deps.$rootScope.$broadcast.calls.reset();

					deps.$httpBackend.expectGET(/.*\/profile\/[0-9]+/).respond(500, {});
					deps.session.updateProfile();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('gotProfile',jasmine.anything());
				});

				it('Should fire the correct event upon contacts update',function(){
					deps.$httpBackend.expectGET(/.*\/contacts/).respond(200, {});
					deps.session.updateContacts();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotContacts',jasmine.any(Object));

					deps.$rootScope.$broadcast.calls.reset();

					deps.$httpBackend.expectGET(/.*\/contacts/).respond(500, {});
					deps.session.updateContacts();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('gotContacts',jasmine.anything());
				});

				it('Should fire the correct event upon subscriptions update',function(){
					deps.$httpBackend.expectGET(/.*\/subscriptions/).respond(200, {});
					deps.session.updateSubscriptions();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotSubscriptions',jasmine.any(Object));

					deps.$rootScope.$broadcast.calls.reset();

					deps.$httpBackend.expectGET(/.*\/subscriptions/).respond(500, {});
					deps.session.updateSubscriptions();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('gotSubscriptions',jasmine.anything());
				});

				it('Should fire the correct event upon translation update',function(){
					deps.$httpBackend.expectGET(/.*\/translation\/[a-z]+$/).respond(200, {});
					deps.session.updateTranslation();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('gotTranslation');

					deps.$rootScope.$broadcast.calls.reset();

					deps.$httpBackend.expectGET(/.*\/translation\/[a-z]+/).respond(500, {});
					deps.session.updateTranslation();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('gotTranslation');

					deps.$rootScope.$broadcast.calls.reset();

					deps.$httpBackend.expectGET(/.*\/translation\/[a-z]+/).respond(500, { translation: { test: 'yay'}});
					deps.session.updateTranslation();
					deps.http.flush();
					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalledWith('gotTranslation');
				});
			});

			describe('Session lifecycle',function(){
				
				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');
					deps.$httpBackend.expectGET(/\/translation\/[a-z]+$/).respond(200, { translation: {test: 'default'}});
					deps.http.flush();
					spyOn(deps.$rootScope,'$broadcast');
				});

				it('Verify session state after succesful login',function(){
					deps.$httpBackend.expectPOST('/login').respond(200, {idNEO: 13, lang:'es', admin:false});
					deps.$httpBackend.expectGET(/\/profile\/[0-9]+/).respond(200, { test: 'hola'});
					deps.$httpBackend.expectGET('/contacts').respond(200, { test: 'bonjour'});
					deps.$httpBackend.expectGET('/subscriptions').respond(200, { test: 'hello'});
					deps.$httpBackend.expectGET(/\/translation\/[a-z]+$/).respond(200, { translation: { test: 'yay'}});
					deps.session.login({});

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotProfile',{ test: 'hola'});
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotContacts',{ test: 'bonjour'});
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotSubscriptions',{ test: 'hello'});

					expect(deps.session.isLoggedIn()).toBe(true);
					expect(deps.session.isAdmin()).toBe(false);
					expect(deps.session.getID()).toEqual(13);
					expect(deps.session.getProfile()).toEqual({ test: 'hola'});
					expect(deps.session.getContacts()).toEqual({ test: 'bonjour'});
					expect(deps.session.getSubscriptions()).toEqual({ test: 'hello'});
					expect(deps.session.getTranslation()).toEqual({ test: 'yay'});
				});

				it('Verify session state after succesful login - 2',function(){
					deps.$httpBackend.expectPOST('/login').respond(200, {idNEO: 13, lang:'es', admin:true});
					deps.$httpBackend.expectGET(/\/profile\/[0-9]+/).respond(200, { test: 'hola'});
					deps.$httpBackend.expectGET('/contacts').respond(200, { test: 'bonjour'});
					deps.$httpBackend.expectGET('/subscriptions').respond(200, { test: 'hello'});
					deps.$httpBackend.expectGET(/\/translation\/[a-z]+$/).respond(200, { translation: { test: 'yay'}});
					deps.session.login({});

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotProfile',{ test: 'hola'});
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotContacts',{ test: 'bonjour'});
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotSubscriptions',{ test: 'hello'});

					expect(deps.session.isLoggedIn()).toBe(true);
					expect(deps.session.isAdmin()).toBe(true);
					expect(deps.session.getID()).toEqual(13);
					expect(deps.session.getProfile()).toEqual({ test: 'hola'});
					expect(deps.session.getContacts()).toEqual({ test: 'bonjour'});
					expect(deps.session.getSubscriptions()).toEqual({ test: 'hello'});
					expect(deps.session.getTranslation()).toEqual({ test: 'yay'});
				});


				it('Verify session state after succesful logout',function(){
					deps.$httpBackend.expectPOST('/login').respond(200, {idNEO: 13, lang: 'es', admin:false});
					deps.$httpBackend.expectGET(/\/profile\/[0-9]+/).respond(200, { test: 'hola'});
					deps.$httpBackend.expectGET('/contacts').respond(200, { test: 'bonjour'});
					deps.$httpBackend.expectGET('/subscriptions').respond(200, { test: 'hello'});
					deps.$httpBackend.expectGET(/\/translation\/[a-z]+$/).respond(200, { translation: { test: 'yay'}});
					deps.session.login({});

					deps.http.flush();

					deps.$httpBackend.expectPOST('/logout').respond(200);
					deps.session.logout();

					deps.http.flush();

					expect(deps.session.isLoggedIn()).toBe(false);
					expect(deps.session.isAdmin()).toBe(false);
					expect(deps.session.getID()).toEqual(0);
					expect(deps.session.getProfile()).toBe(null);
					expect(deps.session.getContacts()).toBe(null);
					expect(deps.session.getSubscriptions()).toBe(null);
					// Do not change the last language
					expect(deps.session.getTranslation()).toEqual({ test: 'yay'});
				});

				it('Should try to change the user language when language is selected',function(){
					deps.$httpBackend.expectPOST('/login').respond(200, { idNEO: 13, lang: 'es', admin: false});
					deps.session.login({});

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',null);
					expect(deps.session.getLang()).toEqual('es');

					deps.$rootScope.$broadcast.calls.reset();
					deps.$httpBackend.expectGET(/.*\/translation\/[a-z]+$/).respond(200, { translation: { test: 'Nokia'}});
					deps.$httpBackend.expectPOST('/change',{ field: 'lang', value: 'en'}).respond(200);
					deps.session.saveLang('en');

					deps.http.flush();

					expect(deps.session.getLang()).toEqual('en');
					expect(deps.session.getTranslation()).toEqual({ test: 'Nokia'});
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotTranslation',jasmine.any(Object));
				});

			});

			describe('Cookies',function(){
				
				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');
					deps.http.flush();
					spyOn(deps.$rootScope,'$broadcast');
				});

				it('Should not fire events when no valid cookie',function(){
					deps.$httpBackend.expectGET('/checkCookie').respond(500);
					deps.$rootScope.$broadcast.calls.reset();
					deps.session.checkCookie();

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).not.toHaveBeenCalled();
				});

				it('Should fire the correct event when valid cookie',function(){
					deps.$httpBackend.expectGET('/checkCookie').respond(200, { idNEO: 13});
					deps.session.checkCookie();

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',null);
				});

				it('Should have the same lifecycle as correct login',function(){
					deps.$httpBackend.expectGET('/checkCookie').respond(200, {idNEO: 13});
					deps.$httpBackend.expectGET(/.*\/profile\/[0-9]+/).respond(200, { test: 'hola', lang: 'es'});
					deps.$httpBackend.expectGET('/contacts').respond(200, { test: 'bonjour'});
					deps.$httpBackend.expectGET('/subscriptions').respond(200, { test: 'hello'});
					deps.$httpBackend.expectGET(/.*\/translation\/[a-z]+$/).respond(200, { translation: {test: 'yay'}});
					deps.session.checkCookie({});

					deps.http.flush();

					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('login',null);
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotProfile',{ test: 'hola', lang: 'es'});
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotContacts',{ test: 'bonjour'});
					expect(deps.$rootScope.$broadcast).toHaveBeenCalledWith('gotSubscriptions',{ test: 'hello'});

					expect(deps.session.isLoggedIn()).toBe(true);
					expect(deps.session.isAdmin()).toBe(false);
					expect(deps.session.getID()).toEqual(13);
					expect(deps.session.getProfile()).toEqual({ test: 'hola', lang: 'es'});
					expect(deps.session.getContacts()).toEqual({ test: 'bonjour'});
					expect(deps.session.getSubscriptions()).toEqual({ test: 'hello'});
					expect(deps.session.getTranslation()).toEqual({ test: 'yay'});
				});

				it('Should set the admin flag correctly',function(){
					deps.$httpBackend.expectGET('/checkCookie').respond(200, { idNEO: 13, lang: 'es', admin:true});
					deps.session.checkCookie();

					deps.http.flush();

					expect(deps.session.isLoggedIn()).toBe(true);
					expect(deps.session.isAdmin()).toBe(true);
					expect(deps.session.getID()).toEqual(13);
				});
			});
		}
	});
})();
