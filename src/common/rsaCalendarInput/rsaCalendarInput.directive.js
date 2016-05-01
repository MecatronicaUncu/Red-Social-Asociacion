(function(){

    'use strict';

    angular.module('linkedEnibApp')
        .directive('rsaCalendarInput', function(){
            return {
                restrict: 'A',
                scope: {
                    daysSelected: '='
                },
                link: function(scope, element){
                    function renderCalendar(){
                        element.pickadate('picker').render();
                    }

                    scope.$watchCollection('daysSelected', function(){
                        renderCalendar();
                    });

                    element.pickadate({
                        clear: false,
                        min: new Date(),
                        format: 'dd/mm/yyyy',
                        firstDay: 1, //Monday
                        disable: [
                            true,
                            function(){ return scope.daysSelected.map(function(boolDay,i){i=i+1; i=(i===7?0:i); return boolDay?i:10;}); }
                        ]
                    });
                }
            };
        });
})();
