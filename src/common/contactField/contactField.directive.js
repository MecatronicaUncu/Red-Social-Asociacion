(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('contactField', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'contactField/contactField.tpl.html',
        controller: function($scope,users,session){
          $scope.users = users;
          $scope.session = session;
        },
        scope: {
          person: '='
        }
      };
    });
})();
