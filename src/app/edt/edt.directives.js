(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .directive('edtEnter', function () {
      return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
          if(event.which === 13) {
            scope.$apply(function (){
              scope.$eval(attrs.edtEnter);
            });
            event.preventDefault();
          }
        });
      };
    });
})();
