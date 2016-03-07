(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('rsaPubBar',function(){
      return {
        restrict: 'E',
        templateUrl: 'pubBar/pubBar.tpl.html',
        controller: 'PubBarCtrl'
      };
    });
})();
