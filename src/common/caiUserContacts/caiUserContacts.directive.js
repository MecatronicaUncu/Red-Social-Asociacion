(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('caiUserContacts', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'caiUserContacts/caiUserContacts.tpl.html'
      };
    });
})();
