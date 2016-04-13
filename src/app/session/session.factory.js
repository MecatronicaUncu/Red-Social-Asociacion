(function(){

		'use strict';

		angular.module('linkedEnibApp')
      .factory('session',function($rootScope,$http) {
        var ID = 0;
        var admin = false;
        var loggedIn = false;
        var lang = 'es';
        var profile = null;
        var translation = null;
        var subscriptions = null;
        var contacts = null;

				/*
				 *	Private setters.
				 *
				 *	Save a copy of the objects and fire the proper event.
				 */

				var setID = function(_ID){
					ID = _ID;
				};
				var setAdmin = function(_admin){
					admin = _admin;
				};
				var setLoggedIn = function(_loggedIn){
					loggedIn = _loggedIn;
				};
				var setLang = function(_lang){
					lang = _lang;
          api.updateTranslation();
          if(api.isLoggedIn()){
              api.saveLang();
					}
					//TODO: saveLang merge with updateTranslation. If we update lang, server must return translation for selected lang.
				};
				var setProfile = function(_profile){
					profile = angular.copy(_profile);
					$rootScope.$broadcast('gotProfile',angular.copy(_profile));
				};
				var setTranslation = function(_translation){
					translation = angular.copy(_translation);
					$rootScope.$broadcast('gotTranslation',angular.copy(_translation));
				};
				var setSubscriptions = function(_subscriptions){
					subscriptions = angular.copy(_subscriptions);
					$rootScope.$broadcast('gotSubscriptions',angular.copy(_subscriptions));
				};
				var setContacts = function(_contacts){
					contacts = angular.copy(_contacts);
					$rootScope.$broadcast('gotContacts',angular.copy(_contacts));
				};

				/*
				 * Private functionality.
				 */

				var log = function(inOut,_ID,err){
					if(inOut==='in'){
						if(err){
							$rootScope.$broadcast('login',err);
						}else{
							setLoggedIn(true);
							setID(_ID);
              api.updateProfile();
              api.updateContacts();
              api.updateSubscriptions();
              $rootScope.$broadcast('login',null);
						}
          }
          else{ // inOut==='out'
						if(err){
              $rootScope.$broadcast('logout',err);
						}else{
              setLoggedIn(false);
              setAdmin(false);
              setProfile(null);
              setSubscriptions(null);
              setContacts(null);
              setID(0);
              $rootScope.$broadcast('logout',null);
						}
          }
				};

				/*
				 * Pubilc API
				 */

				var api = {
					logout: function(){
						$http({method:'POST',url:'/logout',data:{id:api.getID()}})
							.success(function(){
								log('out',null,null);
              })
              .error(function(err){
								log('out',null,err);
              });
					},
          login: function(person){
            $http({method:'POST',url:'/login',data:person})
            .success(function(data){
              if (data && data.idNEO){
                log('in', data.idNEO, null);
              }else{
                log('in', null, 'The server returned no ID');
              }
              if(data && data.admin){
                setAdmin(true);
                $rootScope.$broadcast('gotAdmin');
              }
              if(data && data.lang){
                setLang(data.lang);
              }
            })
            .error(function(err){
              log('in',null,err);
            });
          },
					checkCookie: function() {
            $http({method:'GET', url:'/checkCookie'})
            .success(function (data){
              log('in',data.idNEO);
              if(data.admin){
                setAdmin(true);
                $rootScope.$broadcast('gotAdmin');
              }
              setLang(data.lang);
            })
            .error(function(){
            });
					},
					updateContacts: function(){
            $http({method:'GET', url:'/contacts'})
            .success(function (_contacts){
								setContacts(_contacts);
                return;
            })
            .error(function(){
                return;
            });
					},
					getContacts: function(){
						return angular.copy(contacts);
					},
					updateSubscriptions: function(){
            $http({method:'GET', url:'/subscriptions'})
            .success(function (_subscriptions){
								setSubscriptions(_subscriptions);
                return;
            })
            .error(function(){
                return;
            });
					},
					getSubscriptions: function(){
						return angular.copy(subscriptions);
					},
					updateProfile: function(){
            $http({method:'GET', url:'/profile/'+api.getID()})
            .success(function (_profile){
								setProfile(_profile);
                return;
            })
            .error(function(){
                return;
            });
					},
					getProfile: function(){
						return angular.copy(profile);
					},
					updateTranslation: function(){
            $http({method:'GET', url:'/translation/'+api.getLang()})
            .success(function(data){
              if(data.translation){
                setTranslation(data.translation);
              }
            })
            .error(function(){
            });
					},
					getTranslation: function(){
						return angular.copy(translation);
					},
					saveLang: function(_lang){
						if(_lang){
							setLang(_lang);
						}else{
							$http({method:'POST', url:'/change', data:{field:'lang', value:api.getLang()}})
							.success(function(){
								//Ok. Nothing to do
							})
							.error(function(){
								//Oh no! But nothing to do.
							});
						}
					},
					isLoggedIn: function() {
            return loggedIn;
					},
					isAdmin: function(){
            return admin;
					},
					getID: function() {
            return ID;
					},
					getLang: function(){
						return lang;
					}
				};

				return api;
      });
})();
