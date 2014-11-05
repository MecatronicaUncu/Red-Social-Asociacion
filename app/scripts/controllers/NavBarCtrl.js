/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

angular.module('linkedEnibApp')
.controller('NavBarCtrl',function($scope,$location,session){
   
    $scope.update = function(){
         $scope.navBarItems=[
             {name:'Inicio', href:'#/', active:$location.path()==='/', visible:'true'},
             {name:'Buscar', href:'#/search', active:$location.path()==='/search', visible:'true'},
             {name:'Perfil', href:'#/profile/'+session.getId(), active:$location.path()==='/profile/'+session.getId(), visible:session.isLogged()},
             {name:'EDT', href:'#/edt/', active:$location.path()==='/edt/', visible:'true'},
             {name:'Creadores', href:'#/about', active:$location.path()==='/about', visible:'true'}
         ];
     };
   
    $scope.$on('$locationChangeStart', function(event,newUrl,oldUrl){
        $scope.update();
    });
    
    $scope.$on('update',function(){
        $scope.update();
    });
       
});

