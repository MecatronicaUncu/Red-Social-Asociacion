'use strict';

var App = angular.module('linkedEnibApp');

App.controller('MainCtrl', function ($scope, $rootScope, $http, $cookieStore, session,users) {

    $scope.hideSignIn = true;
    $scope.hideSignUp = true;

    $scope.session = session;

    $scope.they = [];
    
    $(document).ready(function(){
                              
        
       users.they(function(err,users){
			if(err){
				console.log(err);
			} else {
				$scope.they = users;
				$scope.they.forEach(function(el){
        			el['link']=session.host+':3000/usr/'+el['id'].toString()+'/pic';
   				});	
			}
		});
		
    });
    
    $scope.login = function(person){
    	users.login(person,function(err){
    		if(err){
    			console.log(err);
    			$('#signinicon').removeClass('fa-spin fa-spinner').addClass('fa-play');
                $scope.loginFailed = true;
    		} else {
    			$('#signinicon').removeClass('fa-spin fa-spinner').addClass('fa-thumbs-o-up');
    		}
    	});
    	
    	$('#signinicon').removeClass('fa-play').addClass('fa-spin fa-spinner');
    };  
      
    $scope.signup = function(){
        var person = {};
        /*$scope.fields.forEach(function(el){
           person[el.name] = el.model;
        });*/
        
        users.signup($scope.fields,function(err){
        	if(err){
        		console.log(err);
        	}// else {
        		//LO HACE EL users.signup
        		//$scope.login(person);
        	//}
        });
      };   
  });
