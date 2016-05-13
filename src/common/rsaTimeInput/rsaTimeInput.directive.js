(function(){

    'use strict';

    angular.module('RedSocialAsociacion')
        .directive('rsaTimeInput', function(){
            return {
                restrict: 'A',
                scope: {
                    limits: '='
                },
                link: function(scope, element){

                    element.pickatime({
                        clear: false,
                        min: scope.limits.start.split('h').map(function(el){return parseInt(el);}),
                        max: scope.limits.end.split('h').map(function(el){return parseInt(el);}),
                        format: 'HH!hi',
                        editable: false
                    });
                }
            };
        });
})();

