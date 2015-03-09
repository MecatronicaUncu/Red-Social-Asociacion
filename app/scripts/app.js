'use strict';

angular
  .module('linkedEnibApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngCookies',
    'ui.bootstrap',
    'placeholders.img'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/profile/:id', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/profile/', {
          templateUrl: 'views/profile.html',
          controller: 'ProfileCtrl'
      })
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .when('/about',{
        templateUrl: 'views/about.html'
      })
      .when('/admin',{
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      })
      .when('/edt',{
        templateUrl: 'views/edt.html',
        controller: 'EdtCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $httpProvider.defaults.withCredentials = true;
  })
  .directive('caiHomeSignin', function(){
      return {
        restrict: 'E', // Element Name <cai-home-signin></cai-home-signin>
        templateUrl: '/components/cai-home-signin.html',
        scope: {
            'loginn': '&caiSubmit',
            person : '=person',
            loginFailed: '=caiLoginFailed'
        }
      };
  })
  .directive('caiHomeSignup', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: '/components/cai-home-signup.html',
        scope: {
            'signup': '&caiSubmit',
            fields: '=caiFields'
        }
      };
  })
  .directive('caiHomeUser', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: '/components/cai-home-user.html',
        scope: {
            they: '=caiThey',
            host: '=caiHost'
        }
      };
  })
  .directive('contactField', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: '/components/contact-field.html',
        scope: {
          	people: '=people',
          	ops:	'=ops'
        }
      };
  })
  .directive('caiUserProfile', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: '/components/cai-user-profile.html',
        scope: {
            fields: '=caiFields',
            session: '=caiSession',
            'updateProfile': '&caiUpdateProfile'
        }
      };
  })
  .directive('caiUserContacts', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: '/components/cai-user-contacts.html'
      };
  })
  .service('session',function($rootScope,$http,$timeout) {
    this.loggedIn = false;
    //Es necesario? No se hace sólo con las cookies?
    this.ID = 0;
    this.host_LAN = 'https://192.168.0.6';
    this.host_LOC = 'https://127.0.0.1';
    this.host_NET = 'https://edt.mecatronicauncu.org';
    this.host = this.host_LAN;
    this.admin = false;
    this.lang = 'ES_AR';
    this.profile = null;
    this.translation = null;
    
    this.getMyProfile = function(){
        var session = this;
        $http({method:'GET', url:session.host+':3000/profile'})
	    .success(function (profile){
            session.profile = profile;
            $rootScope.$broadcast('gotProfile');
            return;
        })
        .error(function(){
            console.log('Error getting my profile');
            return;
        });
    };
    
    this.setUserID = function(id){
        this.ID = id;
    };
    this.log = function(inOut){
        if(inOut==='in'){
            this.loggedIn = true;
            $rootScope.$broadcast('login');
            //$rootScope.$broadcast('update');
        }
        else if(inOut==='out'){
            this.loggedIn = false;
            this.setAdmin(false);
            this.profile = null;
            this.setUserID(0);
            $rootScope.$broadcast('logout');
            //$rootScope.$broadcast('update');
        }
    };
    this.checkCookies = function() {
    	var session = this;
    	$http({method:'GET', url:session.host+':3000/checkCookie'})
	    .success(function (data){
	    	console.log(data);
	      	session.setUserID(data.idNEO);
            session.getMyProfile();
	      	session.setLang(data.lang);
            session.getTranslation();
	      	session.log('in');
            //TODO: Necesario?
            $rootScope.$broadcast('login');
	      	
	      	$http({method:'GET', url:session.host+':3000/checkAdminCookie'})
	      	.success(function(){
	    		session.setAdmin(true);
	    		$rootScope.$broadcast('gotAdmin');
	        })
	        .error(function(){
				session.setAdmin(false);
	        });
	    })
	    .error(function(){
	        session.setUserID(0);
            session.getTranslation(session.lang);
	        session.log('out');
            $rootScope.$broadcast('logout');
	    });
    };
    this.getTranslation = function(){
        var session = this;
        $http({method:'GET', url:session.host+':3000/translation/'+session.lang})
	      	.success(function(data){
                session.setTranslation(data.translation);
	        })
	        .error(function(){
				console.log('Error getting translations');
	        });
    };
    this.setTranslation = function(translation){
        this.translation = translation;
        $rootScope.$broadcast('gotTranslation');
    };
    this.isLogged =  function() {
    	return this.loggedIn;
    };
    this.isAdmin = function(){
    	return this.admin;  
    };
    this.setAdmin = function(admin){
    	this.admin = admin;
    };
    this.getId = function() {
        return this.ID;
    };
    this.setLang = function(lang){
        this.lang = lang;
    };
  })
  .service('users', function($http, $rootScope, session) {
  	
  	var funcs = {
            they: function(next){
            	$http({method:'GET', url:session.host+':3000/they'})
            		.success(function (data){
                		var err = null;
                		return next(err,data.they);
                    })
                    .error(function(){
                            var err = 'error';
                            return next(err,{});
                    });  		
            },
            login: function(person,next){
                $http({method:'POST',url:session.host+':3000/login',data:person})
                .success(function(data){
                    if (data.idNEO==null){
                        return next('Error');
                    }else{
                        session.setUserID(data.idNEO);
                        session.log('in');
                        $rootScope.$broadcast('login');
                        //TODO: Por qué checkCookies si ya logeamos??
                        //Por las de Admin. Sólo checkAdmin?
                        session.checkCookies();
                        return next(null);
                    }
                })
                .error(function(data){
                    return next('Error');
                });
            },
            signup: function(person,next){
                $http({method:'POST',url:session.host+':3000/signup',data:person})
                .success(function(data){
                    if (data.idNEO == null){
                        return next('ID was null');
                    }else{
                        //return funcs.login(person,next);
                        return next(null);
                    }
                })
                .error(function(data){
                    return next('Signup Failed');
                });
            }
        };
  	
    return funcs;
  })
  .service('edt',function($http, session){
  	
  	var funcs = {
            getTimes: function(whatId,whoId,week,year, next){
                $http({method:'GET', url:session.host+':3000/times',
                    params:{whatId:whatId, whoId:whoId, week:week, year:year}})
                .success(function(times){
                        return next(null,times);
                })
                .error(function(data){
                        return next('Error Getting Times',data);
                });
            },
            getConfig: function(next){
                $http({method:'GET', url:session.host+':3000/edtconfig'})
                .success(function(config){
                    console.log(config);
                    return next(null,config);
                })
                .error(function(data){
                  return next('Error Getting EDT Config',data);
                });
            },
            getPlaces: function(next){
                $http({method:'GET', url:session.host+':3000/edtplaces'})
                .success(function(data){
                    return next(null,data.data);
                })
                .error(function(data){
                    return next('Error Getting EDT Places',data);
                });
            },
            newActivity: function(activities,next){
                $http({method:'POST', url:session.host+':3000/edtnewact', data:{activities:activities}})
                .success(function(){
                    return next(null);
                })
                .error(function(){
                    return next('Error Saving New Activities');
                });
            }
  	};

  	return funcs;
  })
  .factory('formDataObject', function() {
    return function(data) {
        var fd = new FormData();
        angular.forEach(data, function(value, key) {
            fd.append(key, value);
        });
        
        return fd;
    };
  })
  .run(function(session){
    session.checkCookies();
  });
