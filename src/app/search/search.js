/* File generated with "addCtrlAndView" script for Windows 
 * File: profile Controller 
 */

/*global
    angular
*/

(function(){

    'use strict';

    angular.module('linkedEnibApp')
      .config(['navBarProvider',function(navBarProvider){
        navBarProvider.addTab('search',function(session,$location){
          var translation = session.getTranslation();
          if(translation !== null){
            return {name:translation.navBar.search, href:'#/search', active:$location.path()==='/search', visible:true};
          }else{
            return {};
          }
        });
      }])
    .controller('SearchCtrl', function ($scope,$http,session,users,formDataObject) {

        $scope.results = [];

        $scope.users = users;
        $scope.translation = session.getTranslation();

        $scope.search = function(){
            var text = $('#search_text').val();
            if (text===''){
                $scope.results = [];
                return;
            }
            var path = '/search?what=Users&term='+text;
            $http({method:'GET', url:path})
                .success(function (results){
                    console.log(results);
                    $scope.people=results;
                    $scope.people.forEach(function(el){
                        el['link']='/usr/'+el['idNEO'].toString()+'/pic';
                    }); 
            });
            path = '/search?what=Parts&term='+text;
            $http({method:'GET', url:path})
                .success(function (results){
                    console.log(results);
                    $scope.parts=results;
                    $scope.parts.forEach(function(el){
                        el['link']='/usr/'+el['idNEO'].toString()+'/pic';
                    }); 
            });
        };

        $scope.makeFriend = function(id){
            var ids = {idUsr:session.getID(),idFriend:id};
            $http({method:'POST' , url:'/friend', data:ids})
                .success(function (data){
                    console.log("verify");
            });
        };

		$scope.$on('gotTranslation',function(){
			$scope.translation = session.getTranslation();
		});

      });
})();
