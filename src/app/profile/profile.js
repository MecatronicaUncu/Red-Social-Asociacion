/* File generated with "addCtrlAndView" script for Windows 
 * File: profile Controller 
 */

/*global
    angular
*/

(function(){

    'use strict';

    angular.module('RedSocialAsociacion')
      .config(['navBarProvider',function(navBarProvider){
        navBarProvider.addTab('profile',function(session,$location){
          var translation = session.getTranslation();
          if(translation !== null){
            return {name:translation.navBar.profile, href:'#/profile/'+session.getID(), active:$location.path()==='/profile/'+session.getID(), visible:session.isLoggedIn()};
          }else{
            return {};
          }
        });
      }])
    .controller('ProfileCtrl', function ($scope,$http,$stateParams,session,formDataObject,$location) {

        $scope.translation = session.getTranslation();

        $scope.image = '/usr/' + $stateParams.id + '/pic';
                
        $scope.fields = [
            {label:'firstName', name:'firstName', model:'', icon:'fa-user'},
            {label:'lastName', name:'lastName', model:'', icon:'fa-user'},
            {label:'address', name:'address', model:'', icon:'fa-home'},
            {label:'age', name:'age', model:'', icon: 'fa-calendar'},
            {label:'profession', name:'profession', model:'', icon: 'fa-graduation-cap'}
          ];
                
        $scope.profileNavItems=[
            {name:'profile'},
            {name:'contacts'},
            {name:'chpass'},
            {name:'signout'},
            {name:'deluser'}
          ];

        $scope.profileTab = 'profile';

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
            var data = {changes: {}, id:0};
            data.id = session.getID();
            $scope.fields.forEach(function(el,index){
                data.changes[el.name] = $('#'+el.name).text().trim();
            });

            $http({method:'POST',url:'/uptprofile',data:data})
                    .success(function(){
                        $('#updateSubmit > span').removeClass('fa-refresh').addClass('fa-check');
                        $('#updateSubmit').prop('disabled',true);
                        $('.profile-input').prop('contenteditable',false);
                        $('.profile-data-table').css('border','none');
                    })
                    .error(function(data){
                        $('#updateSubmit > span').removeClass('fa-refresh').addClass('fa-warning');
                    }); 
        };
        
        $scope.loadProfile = function(){
            $scope.itsme = session.isLoggedIn() && ($stateParams.id == session.getID());
            if(! $scope.itsme){
                var path = '/profile/' + $stateParams.id;
                $http({method:'GET', url:path})
                .success(function (profile){
                    $scope.fields.forEach(function(el){
                        el.model=profile[el.name];
                    });
                })
                .error(function(err){
                    console.log('Error loading profile');
                });
            }else{
                if(session.getProfile()){
										var profile = session.getProfile();
                    $scope.fields.forEach(function(el){
                        el.model=profile[el.name];
                    });
                }
            }
        };
        $scope.updateContacts = function(){
            var results = session.getContacts();
            if(results === null){
              return;
            }
            $scope.friends = [];
            results.friends.forEach( function(el){
                var temp = el.data;
                temp['link'] = '/usr/'+el['id']+'/pic';
                temp['idNEO'] = el['idNEO'];
                $scope.friends.push(temp);
            });

            $scope.suggestedFriends = [];
            results.suggested.forEach( function(el){
                var temp = el.data;
                temp['link'] = '/usr/'+el['id']+'/pic';
                temp['idNEO'] = el['idNEO'];
                $scope.suggestedFriends.push(temp);
            });

            $scope.requestedFriends = [];
            results.requested.forEach( function(el){
                var temp = el.data;
                temp['link'] = '/usr/'+el['id']+'/pic';
                temp['idNEO'] = el['idNEO'];
                $scope.requestedFriends.push(temp);
            });

            $scope.demandedFriends = [];
            results.demanded.forEach( function(el){
                var temp = el.data;
                temp['link'] = '/usr/'+el['id']+'/pic';
                temp['idNEO'] = el['idNEO'];
                $scope.demandedFriends.push(temp);
            });

            $scope.filtered = $scope.friends;
        };
           
        $scope.click = function(clicked){
            if(clicked.name==='signout'){
							session.logout();
							return;
            }
            else if(clicked.name==='deluser'){
                $scope.deleteUser();
                return;
            }
            else if(clicked.name==='contacts'){
                //$scope.updateContacts();
            }
            $scope.profileTab = clicked.name;
        };
          
        $scope.makeFriend = function(id){
            var ids = {idUsr:session.getID(),idFriend:id};
            $http({method:'POST' , url:'/friend', data:ids})
                .success(function (data){
                    session.updateContacts();
            });
        };
          
        $scope.deleteFriend = function(id){
            var path = '/delFriend';
            $http({method:'POST',url:path})
                .success(function (data){
                    $scope.updateContacts();
            });
        };
            
        $scope.ops = {
            makeFriend: $scope.makeFriend,
            deleteFriend: $scope.deleteFriend
        };
         
        $scope.deleteUser = function(){
            var path = '/delUser/' + session.getID();
            $http({method:'POST',url:path})
                .success(function (data){
                    session.log('out');
            });
        };
        
        $('body').on('change','input[id=\'imginput\']',function(event){
            $scope.uploadPic();
        });
        
        $scope.changeProfilePic = function(){
            if($scope.itsme){
                $('#imginput').trigger('click');
            }
        };
        
        $scope.uploadPic = function() {
            var fd = new FormData();
            fd.append('image',$('#imginput')[0].files[0]);
            return $http.post('/profilepic/' + session.getID(),fd,{
				transformRequest:angular.identity,
                headers: {
                    'Content-Type': undefined
                },
                enctype:'multipart/form-data'
            }).success(function(data){
                $scope.image = '/usr/' + session.getID() + '/pic#' + new Date().getTime();
            });
        };
        
        $scope.changePass = function(pass){
            pass['id']=session.getID();
            var path = '/change';
            $http({method:'POST',url:path, data:pass})
                .success(function(){
                    $scope.profileTab = 'profile';
                });
        };

        $scope.$on('gotContacts',function(e,contacts){
          if(contacts !== null){
            $scope.updateContacts();
          }
        });

        $scope.$on('gotProfile',function(e,profile){
						if(profile !== null){
              $scope.fields.forEach(function(el){
                el.model=profile[el.name];
              });
            }
        });

        if(session.getContacts()){
            $scope.updateContacts();
        }

        $scope.$on('login',function(e,err){
          if(err === null){
            $scope.loadProfile();
          }
        });
        
        $scope.$on('logout',function(e,err){
          if(err === null){
            $location.path('/');
          }
        });

        $scope.$on('gotTranslation',function(e){
          $scope.translation = session.getTranslation();
        });

        $scope.loadProfile();

      });
})();
