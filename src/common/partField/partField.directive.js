(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('partField', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'partField/partField.tpl.html',
        controller: function($scope,$location,users,session){
          $scope.users = users;
          $scope.session = session;
          $scope.location = $location;
        },
        scope: {
          part: '='
        }
      };
    });
})();
