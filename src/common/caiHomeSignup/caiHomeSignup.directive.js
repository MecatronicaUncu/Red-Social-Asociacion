(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('caiHomeSignup', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'caiHomeSignup/caiHomeSignup.tpl.html'
      };
    });
})();
