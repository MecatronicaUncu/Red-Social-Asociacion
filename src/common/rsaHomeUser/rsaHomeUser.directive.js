(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('rsaHomeUser', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'rsaHomeUser/rsaHomeUser.tpl.html',
        scope: {
          they: '=rsaThey',
          host: '=rsaHost'
        }
      };
    });
})();
