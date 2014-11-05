/* File generated with "addCtrlAndView" script for Windows 
 * File: CYGWINTEST Controller 
 */

'use strict';

angular.module('linkedEnibApp')
.controller('ParentCtrl', function ($scope,$http,session,corsReq) {
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

    $(document).ready(function(){
	$http({method:'GET', url:session.host+':3000/testMateria'})
        .success(function (data){
            console.log(data);
        });
    });
    
//    corsReq.makeCors('GET','http://edt.mecatronicauncu.org:3000/they');
    
    $scope.$on('cors-success:GET:http://edt.mecatronicauncu.org:3000/they', function(data){
    	
    	console.log(data);
    });
    
    $scope.$on('cors-error:GET:http://edt.mecatronicauncu.org:3000/they', function(){
    	
    	console.log('CORS ERROR');
    });
  });
