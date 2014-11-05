'use strict';

var userId;

angular
  .module('angularApp', [
    'ngResource',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login',{
        templateUrl: 'views/login.html',
        controller: 'LogCtrl'    
      })
      .when('/signup',{
        templateUrl: 'views/signup.html',
        controller: 'SignCtrl'    
      })
      .when('/user/:id',{
          templateUrl: 'views/profile.html',
          controller: 'ProfileCtrl'
      });
  })
  .controller('MainCtrl',function($http,$scope,$location){
    $http({method:'GET', url:'http://localhost:3000/'})
        .success(function (data){
            $scope.people = data.users[0]._node;
    });
    $scope.go = function (path){
        $location.path(path);
    };
  })
  .controller('LogCtrl',function($http,$scope,$location){
    $scope.getUser = function (person){
        //$http.post('http://localhost:3000/login',person)
        $http({method:'POST',url:'http://localhost:3000/login',data:person})
            .success(function(data){
                if (data.id==null){
                    $scope.msg = "Login Failed";
                    return;
                }
                var path = "/user/" + data.id;
                $location.path(path);
                userId = data.id;
        })
            .error(function(data){
                $scope.msg = "Login Failed";
        });
    };
  })
  .controller('SignCtrl',function($http,$scope,$location){
    $scope.addUser = function (person){
        $http({method:'POST',url:'http://localhost:3000/signup',data:person})
            .success(function(data){
                if (data.id==null){
                    $scope.msg = "Signup Failed";
                    return;
                }
                var path = "/user/" + data.id;
                $location.path(path);
                userId = data.id;
        })
            .error(function(data){
                $scope.msg = "Signup Failed";
        });
    };
   })
    .controller('ProfileCtrl',function($http,$scope,$location){
        var path = $location.path();
        var txt = path.replace("/user/","");
        console.log(userId);
        $scope.id = userId;
        $scope.alreadyFriend;
        $scope.champs = [
            'nom',
            'profession',
            'age'
        ];
        path = 'http://localhost:3000/user/' + txt;
        $http({method:'GET', url:path})
            .success(function (data){
                $scope.nom = data.nom;
                $scope.prenom = data.prenom;
                $scope.age = data.age;
                $scope.profession = data.profession;
                $scope.username = data.username;
        });
        if (txt.valueOf() == userId){
            $scope.canFriend = 0;
            $http({method:'GET', url:'http://localhost:3000/friend/' + txt})
                    .success(function(data){
                        $scope.friends = data.users[0]._node;
                    });
            $http({method:'GET', url:'http://localhost:3000/friend/req/' + txt})
                    .success(function(data){
                        $scope.friendsReq = data.users[0]._node;
                    });
            $http({method:'GET', url:'http://localhost:3000/friend/suggest/' + txt})
                    .success(function(data){
                        $scope.friendsSug = data;
                    });
        }
        else{
            $scope.canFriend = 1;
            $scope.friendId = parseInt(txt);
            path = 'http://localhost:3000/isFriend/' + txt + '/' + $scope.id;
            $http({method:'GET', url:path})
                    .success(function(data){
                        console.log(data);
                        if (data.users==1)
                            $scope.alreadyFriend=1;
                        else
                            $scope.alreadyFriend=0;
                    });
        }            
        $scope.friend = function(){
            var ids = {idUsr:$scope.id,idFriend:parseInt(txt.valueOf())};
            $http({method:'POST' , url:'http://localhost:3000/friend', data:ids})
                .success(function (data){
                     console.log("verify");   
            });
        };
        $scope.deleteFriend = function(){
            var path = 'http://localhost:3000/delFriend/' + txt + '/' + $scope.id;
            $http({method:'POST',url:path})
                .success(function (data){
                     console.log("verify");   
            });
        };
        $scope.deleteUsr = function(){
            $http({method:'POST', url:'http://localhost:3000/delUser/'+ $scope.id})
                .success(function (data){
                    var path = "/";
                    $location.path(path);
                    console.log("verify");   
            });
        };
        $scope.search = function(campo){
            var string = "{" 
            if (campo.campo1!=null){
                if (campo.campo1.label!=null && campo.campo1.data!=null)
                string += campo.campo1.label + ":'" + campo.campo1.data + "'";
            }
            if (campo.campo2!=null){
                if (campo.campo2.label!=null && campo.campo2.data!=null)
                string += "," + campo.campo2.label + ":'" + campo.campo2.data + "'";
            }
            string += '}';
            var tmp = {};
            tmp['string'] = string;
            $http({method:'POST', url:'http://localhost:3000/search',data:tmp})
                    .success(function (data){
                        $scope.usuarios = data.users[0]._node;
            });
        };
        $scope.accept = function(userFriend){
            $http({method:'POST', url:'http://localhost:3000/accept/'+ $scope.id + '/' + userFriend.id})
                .success(function(data){
                    console.log(data);
            })
        };
        $scope.upload = function(file){
            //console.log(file);
            var tmp = {};
            tmp['image']=file;
            $http({method:'POST', url:'http://localhost:3000/profilepic' + txt,data:tmp})
                    .success(function (data){
                        console.log(data);
            });
        };
  });


