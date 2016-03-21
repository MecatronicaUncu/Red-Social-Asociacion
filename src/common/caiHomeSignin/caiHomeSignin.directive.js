(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('caiHomeSignin', function(){
      return {
        restrict: 'E',
        templateUrl: 'caiHomeSignin/caiHomeSignin.tpl.html',
        scope: {
          'loginn': '&caiSubmit',
          person : '=person',
          loginFailed: '=caiLoginFailed'
        }
      };
    });
})();
