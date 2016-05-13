(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('rsaNavBar',function(){
      return {
        restrict: 'E',
        templateUrl: 'navBar/navBar.tpl.html',
      };
    });
})();
