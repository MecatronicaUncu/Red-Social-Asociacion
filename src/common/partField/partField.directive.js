(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('partField', function(){
      return {
        restrict: 'E', // Element Name
        templateUrl: 'partField/partField.tpl.html',
        controller: function($scope,$location,users,session){
          $scope.users = users;
          $scope.session = session;
          $scope.location = $location;

          $scope.subscribe = function(idNEO) {
            if(users.isSubscribed(idNEO)) {
              users.unsubscribeFrom(idNEO, function(){
              });
            } else {
              users.subscribeTo(idNEO, function(){
              });
            }
          };
        },
        scope: {
          part: '='
        }
      };
    });
})();
