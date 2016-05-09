/*global 
    angular
*/

(function(){

    'use strict';

    angular.module('RedSocialAsociacion')
      .config(['navBarProvider',function(navBarProvider){
        navBarProvider.addTab('main',function(session,$location){
          var translation = session.getTranslation();
          if(translation !== null){
            return {name:translation.navBar.home, href:'#/', active:$location.path()==='/', visible:true};
          }else{
            return {};
          }
        });
      }])
      .controller('MainCtrl', function ($scope, $rootScope, $http, $cookieStore, session,users) {
        
        $scope.hideSignIn = true;
        $scope.hideSignUp = true;

        $scope.session = session;
        $scope.translation = session.getTranslation();

        $scope.they = [];
        
        $(document).ready(function(){
                                  
            
           users.they(function(err,users){
                if(err){
                    console.log(err);
                } else {
                    $scope.they = users;
                    $scope.they.forEach(function(el){
                        el['link']='/usr/'+el['idNEO'].toString()+'/pic';
                    });
                }
            });

        });

		$scope.$on('gotTranslation',function(){
			$scope.translation = session.getTranslation();
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
