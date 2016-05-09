(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('rsaUserProfile', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'rsaUserProfile/rsaUserProfile.tpl.html',
        scope: {
          fields: '=rsaFields',
          session: '=rsaSession',
            'updateProfile': '&rsaUpdateProfile'
        }
      };
    });
})();
