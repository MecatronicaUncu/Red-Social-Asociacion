(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('caiHomeUser', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'caiHomeUser/caiHomeUser.tpl.html',
        scope: {
          they: '=caiThey',
          host: '=caiHost'
        }
      };
    });
})();
