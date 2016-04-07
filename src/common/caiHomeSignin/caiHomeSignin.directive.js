(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('caiHomeSignin', function(){
      return {
        restrict: 'E',
        templateUrl: 'caiHomeSignin/caiHomeSignin.tpl.html'
      };
    });
})();
