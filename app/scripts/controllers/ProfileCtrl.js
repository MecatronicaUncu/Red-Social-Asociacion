/* File generated with "addCtrlAndView" script for Windows 
 * File: profile Controller 
 */

'use strict';

angular.module('linkedEnibApp')
.controller('ProfileCtrl', function ($scope,$http,$routeParams,session,formDataObject) {

    $scope.image = session.host+':3000/usr/' + $routeParams.id + '/pic';
    
    $scope.profileNavItems=[
        {name:'Perfil', href:'#/profile/'+$routeParams.id},
        {name:'Contactos', href:'#/profile/'+$routeParams.id},
		{name:'Cambiar Contraseña', href:'#/profile/'+$routeParams.id},
        {name:'Cerrar Sesión', href:'#/'},
        {name:'Eliminar Usuario', href:'#/'}
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
        $scope.fields.forEach(function(el,index){
            if(index===$scope.fields.length-1){
                return;
						}
            var data = {field:el.name, value:$('#'+el.name).text().trim(), id:session.getId()};
            console.log(data);
            $http({method:'POST',url:session.host+':3000/change',data:data})
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
        });
    };
      
    $scope.updateContacts = function(){
		console.log('UPDATE CONTACTS: GETID: '+session.getId()+' ROUTEID: '+$routeParams.id+'valid '+(session.getId()===$routeParams.id));
        $scope.showNavBar = (session.getId()==$routeParams.id) && ($routeParams.id != 0);
        var path = session.host+':3000/usr/' + $routeParams.id;
        $http({method:'GET', url:path})
        .success(function (result){
            console.log(result);
            $scope.fields.forEach(function(el){
                el.model=result.user[el.name];
            });
            console.log(result);
            if ($scope.showNavBar){

                result.friends.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.friends.push(temp);
                });


                result.suggested.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.suggestedFriends.push(temp);
                });


                result.requested.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.requestedFriends.push(temp);
                });


                result.demanded.forEach( function(el){
                    var temp = el.data;
                    temp['link'] = session.host+':3000/usr/'+el['id']+'/pic';
                    temp['id'] = el['id'];
                    $scope.demandedFriends.push(temp);
                });

                $scope.filtered = $scope.friends;
            };
        });
    };
       
    $scope.click = function(clicked){
        if(clicked.name==='Cerrar Sesión'){
			$http({method:'POST',url:session.host+':3000/logout',data:{id:session.getId()}})
				.success(function(){
					console.log('Success Logging out');
					session.log('out');
				})
				.error(function(){
					console.log('Error logging out');
				});
			return;
        }
        if(clicked.name==='Eliminar Usuario'){
            $scope.deleteUser();
            return;
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

    $scope.updateContacts();

  });
