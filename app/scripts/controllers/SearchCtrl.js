/* File generated with "addCtrlAndView" script for Windows 
 * File: profile Controller 
 */

'use strict';

angular.module('linkedEnibApp')
.controller('SearchCtrl', function ($scope,$http,session,formDataObject) {

    $scope.results = [];

    $scope.search = function(){
        var text = $('#search_text').val();
        if (text===''){
            $scope.results = {};
            return;
        }
        var path = session.host+':3000/search?fnm='+text+'&lnm='+text+'&prf='+text;
        $http({method:'GET', url:path})
            .success(function (data){
                $scope.results=data.users;
                $scope.results.forEach(function(el){
                    el['link']=session.host+':3000/usr/'+el['id'].toString()+'/pic';
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
