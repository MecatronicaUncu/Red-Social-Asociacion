/* File generated with "addCtrlAndView" script for Windows 
 * File: CYGWINTEST Controller 
 */

'use strict';

angular.module('linkedEnibApp')
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
   
  });
