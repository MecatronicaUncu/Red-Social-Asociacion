'use strict';

var App = angular.module('linkedEnibApp');

App.controller('MainCtrl', function ($scope, $rootScope, $http, $cookieStore, session,users) {

    $scope.hideSignIn = true;
    $scope.hideSignUp = true;

    $scope.session = session;

    $scope.they = [];
    
    $(document).ready(function(){
                              
        $scope.fields = [
            {label:'Fisrt Name', name:'firstName', model:'', pholder:'Fist Name',
                type:'text', required:'true', icon:'fa-user',
                minlength:'1', maxlength:'30'},
            {label:'Last Name', name:'lastName', model:'', pholder:'Last Name',
                type:'text', required:'true', icon:'fa-user',
                minlength:'1', maxlength:'30'},
            {label:'Age', name:'age', model:'', pholder:'Age',
                type:'number', required:'true', icon:'fa-calendar-o',
                min:18},
            {label:'Username', name:'username', model:'', pholder:'Username',
                type:'text', required:'true', icon:'fa-user',
                minlength:'1', maxlength:'30'},
            {label:'Password', name:'password', model:'', pholder:'Password',
                type:'password', required:'true', icon:'fa-key',
                minlength:'3', maxlength:'10'},
            {label:'Profession', name:'profession', model:'', pholder:'Profession',
                type:'text', required:'false', icon:'fa-graduation-cap',
                minlength:'1', maxlength:'30'},
            {label:'Address', name:'address', model:'', pholder:'Address',
                type:'text', required:'false', icon:'fa-home',
                minlength:'1', maxlength:'30'},
            {label:'Phone Number', name:'phone', model:'', pholder:'Phone Number',
                type:'tel', required:'false', icon: 'fa-phone',
                minlength:'1', maxlength:'20'}
        ];
        
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
        $scope.fields.forEach(function(el){
           person[el.name] = el.model;
        });
        
        users.signup(person,function(err){
        	if(err){
        		console.log(err);
        	}// else {
        		//LO HACE EL users.signup
        		//$scope.login(person);
        	//}
        });
      };   
  });
