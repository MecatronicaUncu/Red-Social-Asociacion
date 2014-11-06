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
      .when('/edt',{
        templateUrl: 'views/edt.html',
        controller: 'EdtCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $httpProvider.defaults.withCredentials = true;
    //$httpProvider.defaults.useXDomain = true;
    //$httpProvider.defaults.xsrfHeaderName 
    //$httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
    //$httpProvider.defaults.headers.common['X-CSRF-Token'] = $cookies['XSRF-Token'];
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
    this.loggedIn = 'false';
    this.ID = 0;
    this.host_LAN = 'https://192.168.3.3';
    this.host_LOC = 'https://127.0.0.1';
    this.host_NET = 'https://edt.mecatronicauncu.org';
    this.host = this.host_LOC;
    this.setUserID = function(id){
        this.ID = id;
    };
    this.log = function(inOut){
        if(inOut==='in'){
            this.loggedIn = 'true';
            $rootScope.$broadcast('login');
            $rootScope.$broadcast('update');
        }
        else if(inOut==='out'){
            this.loggedIn = 'false';
            this.setUserID(0);
            $rootScope.$broadcast('logout');
            $rootScope.$broadcast('update');
        }
    };
    this.isLogged =  function() {
      return this.loggedIn;
    };  
    this.getId = function() {
        return this.ID;
    };
  })
  .service('users', function($http, session) {
  	
  	var funcs = {
  		they: function(next){
	  		$http({method:'GET', url:session.host+':3000/they'})
	        .success(function (data){
	            //$scope.they=data.users;
	            //console.log('GET THEY OK');
	            //$scope.they.forEach(function(el){
	                //el['link']=session.host+':3000/usr/'+el['id'].toString()+'/pic';
	            //});
	            var err = null;
	            return next(err,data.users);
			})
			.error(function(){
				var err = 'error';
				return next(err,{});
			});  		
	  	},
	  	login: function(person,next){
	        $http({method:'POST',url:session.host+':3000/login',data:person})
            .success(function(data){
                if (data.id==null){
                    return next('Error');
                }
                session.setUserID(data.id);
                session.log('in');
                return next(null);
			})
            .error(function(data){
                return next('Error');
			});
	  	},
	    signup: function(person,next){
	    	$http({method:'POST',url:session.host+':3000/signup',data:person})
	            .success(function(data){
	                if (data.id==null){
	                    return next('ID was null');
	                }else{
	                    return funcs.login(person,next);
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
  		getTypes: function(next){
  			$http({method:'GET', url:session.host+':3000/types'})
  				.success(function(data){
  					return next(null,data.data[0].types);
  				})
  				.error(function(data){
  					return next('Error Getting Types',data);
  				});
  		},
  		getSubTypes: function(type, next){
  			$http({method:'GET', url:session.host+':3000/subtypes', params:{type:type}})
  				.success(function(data){
  					return next(null,data.data[0].subtypes);
  				})
  				.error(function(data){
  					return next('Error Getting Subtypes',data);
  				});
  		},
  		getTimes: function(type, name, next){
  			$http({method:'GET', url:session.host+':3000/times', params:{type:what, name:name}})
  				.success(function(data){
  					return next(null,data);
  				})
  				.error(function(data){
  					return next('Error Getting Times',data);
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
  .run(function(session, $http){
	  $http({method:'GET', url:session.host+':3000/checkCookie'})
		.success(function (data){
            session.setUserID(data.id);
            //console.log('Check Cookies Success');
            session.log('in');
		})
		.error(function(){
			//console.log('No Cookie');
			session.setUserID(0);
			session.log('out');
		});
   });
