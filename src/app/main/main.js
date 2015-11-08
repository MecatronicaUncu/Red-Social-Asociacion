/*global 
    angular
*/

(function(){

    'use strict';

    angular.module('linkedEnibApp')
      .controller('MainCtrl', function ($scope, $rootScope, $http, $cookieStore, session,users) {
        
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
                        el['link']=session.host+':3000/usr/'+el['idNEO'].toString()+'/pic';
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
            $scope.fields.lang = session.lang;
            users.signup($scope.fields,function(err){
                if(err){
                    console.log(err);
                }
                else {
                    window.alert("Active su cuenta desde su casilla de mail para iniciar sesion");
                    $scope.fields = {};
                    $scope.hideSignUp = true;
                    $scope.hideSignIn = false;
                }
            });
          };   
      });
})();
