/*global 
    angular
*/

(function(){

    'use strict';

    angular.module('linkedEnibApp')
      .controller('MainCtrl', function ($scope, $rootScope, $http, $cookieStore, session,users,REMOTE) {
        
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
                        el['link']=REMOTE+'/usr/'+el['idNEO'].toString()+'/pic';
                    });
                }
            });

        });

				$scope.$on('logout',function(e, err){
					if(err){
						$('#signinicon').removeClass('fa-spin fa-spinner').addClass('fa-play');
						$scope.loginFailed = true;
					}else{
						$('#signinicon').removeClass('fa-spin fa-spinner').addClass('fa-thumbs-o-up');
					}
				});
				
				$scope.login = function(person){
					$('#signinicon').removeClass('fa-play').addClass('fa-spin fa-spinner');

					session.login(person);
				};

        $scope.signup = function(){
            $scope.fields.lang = session.getLang();
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
