(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('rsaNavBar',function(){
      return {
        restrict: 'E',
        templateUrl: 'navBar/navBar.tpl.html',
      };
    });
})();
