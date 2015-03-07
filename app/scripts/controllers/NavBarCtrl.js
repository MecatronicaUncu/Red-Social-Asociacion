/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

angular.module('linkedEnibApp')
.controller('NavBarCtrl',function($scope,$location,session){
      
    $scope.updateNavBar = function(){
        if(session.translation){
            var translation = session.translation.navBar;
        
            $scope.navBarItems=[
                {name:translation.home, href:'#/', active:$location.path()==='/', visible:true},
                {name:translation.search, href:'#/search', active:$location.path()==='/search', visible:true},
                {name:translation.profile, href:'#/profile/', active:$location.path()==='/profile', visible:session.loggedIn},
                {name:translation.edt, href:'#/edt/', active:$location.path()==='/edt/', visible:true},
                {name:translation.admin, href:'#/admin/', active:$location.path()==='/admin/', visible:session.admin},
                {name:translation.aboutus, href:'#/about', active:$location.path()==='/about', visible:true}
            ];
        }      
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
        if($(".mm-offcanvas").length != 0){
            $('#navbar').trigger('open.mm');
        }else{
            $(".mm-opened").trigger("close.mm");
        }
    };
       
});

