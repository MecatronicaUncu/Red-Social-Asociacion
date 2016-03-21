(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('caiUserProfile', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'caiUserProfile/caiUserProfile.tpl.html',
        scope: {
          fields: '=caiFields',
          session: '=caiSession',
            'updateProfile': '&caiUpdateProfile'
        }
      };
    });
})();
