(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('rsaUserContacts', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'rsaUserContacts/rsaUserContacts.tpl.html'
      };
    });
})();
