(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('rsaHomeSignup', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'rsaHomeSignup/rsaHomeSignup.tpl.html'
      };
    });
})();
