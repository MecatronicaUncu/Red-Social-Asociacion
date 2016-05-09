/* File generated with "addCtrlAndView" script for Windows 
 * File: CYGWINTEST Controller 
 */
/*global
    angular
*/

(function(){
    'use strict';

    angular.module('RedSocialAsociacion')
    .controller('ParentCtrl', function ($scope,$http,session) {
        $scope.loggedIn=false;
         
        $scope.$on('logout',function(){
            console.log('logout emit');
            $scope.loggedIn=false;
            $scope.$broadcast('update');
        });
        $scope.$on('login',function(){
            console.log('login emit');
            $scope.loggedIn=true;
            $scope.$broadcast('update');
        });
        $scope.$on('$destroy',function (event){
            session.log('out');
        });

        $scope.isIE = function() { return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent) != null)));};

        $(document).ready(function(){
            $('#navbar').mmenu();
            if($scope.isIE()){
                $('#navbar').on('opening.mm', function() {
                    $('.header').css('position','static');
                 }).on('closing.mm',function(){
                    $('.header').css('position','fixed');
                });
            }
        });

      });
})();
