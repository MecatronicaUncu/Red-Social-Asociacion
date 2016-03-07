(function(){

    'use strict';

    angular
      .module('linkedEnibApp', [
        'templates-app',
        'templates-common',
        'ngResource',
        'ngSanitize',
        'ngCookies',
        'ui.bootstrap',
        'placeholders.img',
        'ui.router'
      ])
      .config(function ($httpProvider, $stateProvider, $urlRouterProvider) {
        // For any unmatched url, redirect to /
        $urlRouterProvider.otherwise('/');
        // Now set up the states
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'main/main.tpl.html',
                controller: 'MainCtrl'
            })
            .state('profile', {
                url: '/profile/:id',
                templateUrl: 'profile/profile.tpl.html',
                controller: 'ProfileCtrl'
            })
            .state('search', {
                url: '/search',
                templateUrl: 'search/search.tpl.html',
                controller: 'SearchCtrl'
            })
            .state('admin',{
                url: '/admin',
                templateUrl: 'admin/admin.tpl.html',
                controller: 'AdminCtrl'
            })
            .state('edt',{
                url: '/edt',
                templateUrl: 'edt/edt.tpl.html',
                controller: 'EdtCtrl'
            })
            .state('edt.id',{
                url: '/:id',
                templateUrl: 'edt/edt.tpl.html',
                controller: 'EdtCtrl'
            });

        $httpProvider.defaults.withCredentials = true;
      })
			.constant('REMOTE','https://localhost:3000')
      .directive('caiHomeSignin', function(){
          return {
            restrict: 'E', // Element Name <cai-home-signin></cai-home-signin>
            templateUrl: 'cai-home-signin/cai-home-signin.tpl.html',
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
            templateUrl: 'cai-home-signup/cai-home-signup.tpl.html',
            scope: {
                'signup': '&caiSubmit',
                fields: '=caiFields'
            }
          };
      })
      .directive('caiHomeUser', function(){
          return {
            restrict: 'E', // Element Name
            templateUrl: 'cai-home-user/cai-home-user.tpl.html',
            scope: {
                they: '=caiThey',
                host: '=caiHost'
            }
          };
      })
      .directive('contactField', function(){
          return {
            restrict: 'E', // Element Name
            templateUrl: 'contact-field/contact-field.tpl.html',
            controller: function($scope,users,session){
                $scope.users = users;
                $scope.session = session;
            },
            scope: {
                person: '='
            }
          };
      })
      .directive('partField', function(){
          return {
            restrict: 'E', // Element Name
            templateUrl: 'part-field/part-field.tpl.html',
            controller: function($scope,$location,users,session){
                $scope.users = users;
                $scope.session = session;
                $scope.location = $location;
            },
            scope: {
                part: '='
            }
          };
      })
      .directive('caiUserProfile', function(){
          return {
            restrict: 'E', // Element Name
            templateUrl: 'cai-user-profile/cai-user-profile.tpl.html',
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
            templateUrl: 'cai-user-contacts/cai-user-contacts.tpl.html'
          };
      })
      .directive('edtEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if(event.which === 13) {
                        scope.$apply(function (){
                            scope.$eval(attrs.edtEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        })
      .service('edt',function($http, session,REMOTE){

        var funcs = {
            getTimes: function(whatId,whoId,week,year, next){
                $http({method:'GET', url:REMOTE+'/times',
                    params:{whatId:whatId, whoId:whoId, week:week, year:year}})
                .success(function(times){
                        return next(null,times);
                })
                .error(function(data){
                        return next('Error Getting Times',data);
                });
            },
            getConfig: function(next){
                $http({method:'GET', url:REMOTE+'/edtconfig'})
                .success(function(config){
                    console.log(config);
                    return next(null,config);
                })
                .error(function(data){
                  return next('Error Getting EDT Config',data);
                });
            },
            getPlaces: function(next){
                $http({method:'GET', url:REMOTE+'/edtplaces'})
                .success(function(data){
                    return next(null,data.data);
                })
                .error(function(data){
                    return next('Error Getting EDT Places',data);
                });
            },
            newActivity: function(activities,next){
                $http({method:'POST', url:REMOTE+'/edtnewact', data:{activities:activities}})
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
				session.updateTranslation();
        session.checkCookie();
      });
})();
