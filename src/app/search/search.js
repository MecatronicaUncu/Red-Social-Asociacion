/* File generated with "addCtrlAndView" script for Windows 
 * File: profile Controller 
 */

'use strict';

angular.module('linkedEnibApp')
.controller('SearchCtrl', function ($scope,$http,session,users,formDataObject) {

    $scope.results = [];

    $scope.users = users;

    $scope.search = function(){
        var text = $('#search_text').val();
        if (text===''){
            $scope.results = [];
            return;
        }
        var path = session.host+':3000/search?what=Users&term='+text;
        $http({method:'GET', url:path})
            .success(function (results){
            	console.log(results);
                $scope.people=results;
                $scope.people.forEach(function(el){
                    el['link']=session.host+':3000/usr/'+el['idNEO'].toString()+'/pic';
                }); 
        });
        path = session.host+':3000/search?what=Parts&term='+text;
        $http({method:'GET', url:path})
            .success(function (results){
            	console.log(results);
                $scope.parts=results;
                $scope.parts.forEach(function(el){
                    el['link']=session.host+':3000/usr/'+el['idNEO'].toString()+'/pic';
                }); 
        });
    };

    $scope.makeFriend = function(id){
        var ids = {idUsr:session.getId(),idFriend:id};
        $http({method:'POST' , url:session.host+':3000/friend', data:ids})
            .success(function (data){
                console.log("verify");   
        });
    };
  });
