(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('rsaHomeSignin', function(){
      return {
        restrict: 'E',
        templateUrl: 'rsaHomeSignin/rsaHomeSignin.tpl.html'
      };
    });
})();
