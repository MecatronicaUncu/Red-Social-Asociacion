(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .directive('rsaPubBar',function(){
      return {
        restrict: 'E',
        templateUrl: 'pubBar/pubBar.tpl.html',
        controller: 'PubBarCtrl'
      };
    });
})();
