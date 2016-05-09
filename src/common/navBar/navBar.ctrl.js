/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*global
    angular
*/

(function(){
    'use strict';

    angular.module('RedSocialAsociacion')
      .controller('NavBarCtrl',function($scope,$location,session,navBar){

        $scope.session = session;

        $scope.updateNavBar = function(){
          $scope.navBarItems = navBar.getTabs();
        };

        $scope.avLangs = ['es','en'];

        $scope.selectLang = function(lang){
            console.log(lang);
            session.saveLang(lang);
        };
          
        $scope.$on('gotAdmin', function(){
            $scope.updateNavBar();
        });
        
        $scope.$on('login', function(){
            $scope.updateNavBar();
        });
        
        $scope.$on('logout', function(){
            $scope.updateNavBar();
        });
          
        $scope.$on('gotTranslation', function(){
            $scope.updateNavBar();
        });
          
        $scope.$on('$locationChangeStart', function(event,newUrl,oldUrl){
            $scope.updateNavBar();
            $(".mm-opened").trigger("close.mm");
        });

        $scope.toggleMMenu = function(){
            //console.log($(".mm-offcanvas"));
            if($(".mm-offcanvas").length !== 0){
                $('#navbar').trigger('open.mm');
            }else{
                $(".mm-opened").trigger("close.mm");
            }
        };
           
    });
})();
