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

    angular.module('linkedEnibApp')
      .controller('NavBarCtrl',function($scope,$location,session){
          
        $scope.session = session;
          
        $scope.updateNavBar = function(){
            if(session.getTranslation()){
                var translation = session.getTranslation().navBar;
            
                $scope.navBarItems=[
                    {name:translation.home, href:'#/main', active:$location.path()==='/', visible:true},
                    {name:translation.search, href:'#/search', active:$location.path()==='/search', visible:true},
                    {name:translation.profile, href:'#/profile/'+session.getID(), active:$location.path()==='/profile/'+session.getID(), visible:session.isLoggedIn()},
                    {name:translation.edt, href:'#/edt/'+session.getID(), active:$location.path().match(/^\/edt.*/g), visible:true},
                    {name:translation.admin, href:'#/admin', active:$location.path()==='/admin', visible:session.isAdmin()}
                    //{name:translation.aboutus, href:'#/about', active:$location.path()==='/about', visible:true}
                ];
            }      
        };
        
        $scope.avLangs = ['ar','us','fr'];
        
        $scope.selectLang = function(lang){
            console.log(lang);
            session.setLang(lang);
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
