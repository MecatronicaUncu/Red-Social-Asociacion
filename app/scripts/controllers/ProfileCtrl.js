/* File generated with "addCtrlAndView" script for Windows 
 * File: profile Controller 
 */

'use strict';

angular.module('linkedEnibApp')
.controller('ProfileCtrl', function ($scope,$http,$routeParams,session,formDataObject,$location) {

    if($routeParams.id){
        $scope.image = session.host+':3000/usr/' + $routeParams.id + '/pic';
    }else{
        $scope.image = session.host+':3000/usr/' + session.getId() + '/pic';
    }
    
    $scope.profileNavItems=[
        {name:'Perfil'},
        {name:'Contactos'},
        {name:'Cambiar Contraseña'},
        {name:'Cerrar Sesión'},
        {name:'Eliminar Usuario'}
      ];

    $scope.profileTab = 'Perfil';

    $scope.fields = [
        {label:'Nombre', name:'firstName', model:'', icon:'fa-user'},
        {label:'Apellido', name:'lastName', model:'', icon:'fa-user'},
        {label:'Dirección', name:'address', model:'', icon:'fa-home'},
        {label:'Número', name:'phone', model:'', icon: 'fa-phone'},
        {label:'Edad', name:'age', model:'', icon: 'fa-calendar'},
        {label:'Profesión', name:'profession', model:'', icon: 'fa-graduation-cap'}
      ];

    $scope.filtered = [];
    $scope.friends = [];
    $scope.suggestedFriends = [];
    $scope.requestedFriends = [];
    $scope.demandedFriends = [];
    
    $scope.filter = function(){
        $scope.filtered = [];
        var text = $('#search_text').val();
        var regex = new RegExp(".*"+text+".*",'i');
        $scope.friends.forEach(function(friend){
            if(regex.test(friend.firstName) || regex.test(friend.lastName) || regex.test(friend.profession)){
                $scope.filtered.push(friend);
            }
        });
    };

    $scope.editProfile = function(){
        $('.profile-input').prop('contenteditable',true);
        $('.profile-data-table').css('border-right','5px solid #75c7e3');
        $('#updateSubmit').prop('disabled',false);
        $('#updateSubmit > span').removeClass('fa-check fa-warning').addClass('fa-refresh');
    };

    $scope.updateProfile = function(){
        console.log('Update: ');
        var data = {changes: {}, id:0};
        data.id = session.getId();
        $scope.fields.forEach(function(el,index){
        	data.changes[el.name] = $('#'+el.name).text().trim();
        });
        	
        console.log(data);
        	
        $http({method:'POST',url:session.host+':3000/uptprofile',data:data})
                .success(function(){
                    $('#updateSubmit > span').removeClass('fa-refresh').addClass('fa-check');
                    $('#updateSubmit').prop('disabled',true);
                    $('.profile-input').prop('contenteditable',false);
                    $('.profile-data-table').css('border','none');
                })
                .error(function(data){
                    console.log("Update Failed");
                    $('#updateSubmit > span').removeClass('fa-refresh').addClass('fa-warning');
                }); 
    };
    
    $scope.loadProfile = function(){ 	
        var id = ($routeParams.id)?true:false;
        $scope.showNavBar = (session.isLogged() && !id) || (id && (session.getId() == $routeParams.id));
        if(id && $routeParams.id != session.getId()){
            var path = session.host+':3000/profile/' + $routeParams.id;
            $http({method:'GET', url:path})
            .success(function (profile){
                $scope.fields.forEach(function(el){
                    el.model=profile[el.name];
                });
                console.log(profile);
            })
            .error(function(err){
                console.log('Error loading profile');
            });
        }else{
            //TODO: CAMBIAR POR LOS CAMPOS DIRECTAMENTE QUE VIENEN DEL SERVER
            if(session.profile){
                $scope.fields.forEach(function(el){
                    el.model=session.profile[el.name];
                });
            }
        }
   	};
    $scope.updateContacts = function(){
        console.log($scope.profileTab);
        var path = session.host+':3000/contacts/' + session.getId();
        $http({method:'GET', url:path})
        .success(function (data){
            var results = data.results;
            console.log(results);
            if ($scope.showNavBar){
				$scope.friends = [];
                results.friends.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.friends.push(temp);
                });

				$scope.suggestedFriends = [];
                results.suggested.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.suggestedFriends.push(temp);
                });

				$scope.requestedFriends = [];
                results.requested.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.requestedFriends.push(temp);
                });

				$scope.demandedFriends = [];
                results.demanded.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.demandedFriends.push(temp);
                });

                $scope.filtered = $scope.friends;
                console.log($scope.profileTab);
            };
        });
    };
       
    $scope.click = function(clicked){
        console.log($scope.profileTab);
        if(clicked.name==='Cerrar Sesión'){
            $http({method:'POST',url:session.host+':3000/logout',data:{id:session.getId()}})
            .success(function(){
                    console.log('Success Logging out');
                    session.log('out');
                    $location.path('/');
            })
            .error(function(){
                    console.log('Error logging out');
            });
            return;
        }
        else if(clicked.name==='Eliminar Usuario'){
            $scope.deleteUser();
            return;
        }
        else if(clicked.name==='Contactos'){
            $scope.updateContacts();
        }
        $scope.profileTab = clicked.name;
    };
      
    $scope.makeFriend = function(id){
        var ids = {idUsr:session.getId(),idFriend:id};
        $http({method:'POST' , url:session.host+':3000/friend', data:ids})
            .success(function (data){
                $scope.updateContacts();
                console.log("verify");   
        });
    };
      
    $scope.deleteFriend = function(id){
        var path = session.host+':3000/delFriend/' + id + '/' + session.getId();
        $http({method:'POST',url:path})
            .success(function (data){
                $scope.updateContacts();
                console.log('verify');   
        });
    };
        
    $scope.ops = {
    	makeFriend: $scope.makeFriend,
    	deleteFriend: $scope.deleteFriend
    };
     
    $scope.deleteUser = function(){
        var path = session.host+':3000/delUser/' + session.getId();
        $http({method:'POST',url:path})
            .success(function (data){
                console.log('verify'); 
                session.log('out');
        });
    };
    
    $('body').on('change','input[id=\'imginput\']',function(event){
        $scope.uploadPic();
    });
    
    $scope.changeProfilePic = function(){
        $('#imginput').trigger('click');
    };
    
    $scope.uploadPic = function() {
        console.log($('#imginput')[0]);
        return $http({
            method: 'POST',
            url: session.host+':3000/profilepic/' + session.getId(),
            headers: {
                'Content-Type': undefined
            },
            data: {
                image: $('#imginput')[0].files[0]
            },
            transformRequest: formDataObject
        }).success(function(data){
            $scope.image = session.host+':3000/usr/' + session.getId() + '/pic#' + new Date().getTime();
        });
    };
    
    $scope.changePass = function(pass){
        pass['id']=session.getId();
        var path = session.host+':3000/change';
        $http({method:'POST',url:path, data:pass})
            .success(function(){
                $scope.profileTab = 'Perfil';
            });
    };

    $scope.$on('gotProfile',function(){
        $scope.loadProfile();
        console.log(session.profile);
    });

    $scope.loadProfile();

  });
