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
                url: '/edt/:id',
                templateUrl: 'edt/edt.tpl.html',
                controller: 'EdtCtrl'
            });

        $httpProvider.defaults.withCredentials = true;
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
