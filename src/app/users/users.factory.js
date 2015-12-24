(function(){

  'use strict';

  angular.module('linkedEnibApp')
  .factory('users', function($http, $rootScope, session, REMOTE) {

    var api = {
      they: function(next){
        $http({method:'GET', url:REMOTE+'/they'})
        .success(function (data){
          return next(null,data.they);
         })
         .error(function(err){
           return next(err,null);
         });
      },
      signup: function(user,next){
        $http({method:'POST',url:REMOTE+'/signup',data:user})
        .success(function(data){
          if (data.idNEO == null){
            return next('ID was null',null);
          }else{
            return next(null,data.idNEO);
          }
        })
        .error(function(data){
          return next('Signup Failed',null);
        });
      },
      makeFriend: function(friendID,next){
        var ids = {idUsr:session.getID(),idFriend:friendID};
        $http({method:'POST' , url:REMOTE+'/friend', data:ids})
        .success(function (){
          session.updateContacts();
          return next(null,null);
        })
        .error(function(){
          return next('Error making new Friend',null);
        });
      },
      deleteFriend: function(friendID,next){
        $http({method:'POST',url:REMOTE+'/delFriend',data:{idFriend:friendID}})
        .success(function (){
          session.updateContacts();
          return next(null,null);
        })
        .error(function(){
          return next('Error deleting Friend',null);
        });
      },
      isFriend: function(idNEO){
        var is = false;
        var contacts = session.getContacts();
        if(contacts){
          contacts['friends'].some(function(usr){
            if(usr.idNEO === idNEO){
              is = true;
              return true;
            }else{
             return false;
            }
          });

          return is;
        }else{
          return is;
        }
      },
      isRequested: function(idNEO){
        var is = false;
        var contacts = session.getContacts();
        if(contacts){
          contacts['requested'].some(function(usr){
            if(usr.idNEO === idNEO){
              is = true;
              return true;
            }else{
              return false;
            }
          });

          return is;
        }else{
          return is;
        }
      },
      isDemanded: function(idNEO){
        var is = false;
        var contacts = session.getContacts();
        if(contacts){
          contacts['demanded'].some(function(usr){
            if(usr.idNEO === idNEO){
              is = true;
              return true;
            }else{
              return false;
            }
          });

          return is;
        }else{
          return is;
        }
      },
      isSubscribed: function(idNEO){
        var is = false;
        var subscriptions = session.getSubscriptions();
        if(subscriptions){
          subscriptions.some(function(inst){
            if(inst.idNEO === idNEO){
              is = true;
              return true;
            }else{
              return false;
            }
          });

          return is;
        }else{
          return is;
        }
      },
      subscribeTo: function(instID,next){
        $http({method:'POST',url:REMOTE+'/subscribe',data:{instID:instID}})
        .success(function(){
          session.updateSubscriptions();
          return next(null,null);
        })
        .error(function(){
          return next('Error subscribing',null);
        });
      },
      unsubscribeFrom: function(instID,next){
        $http({method:'POST',url:REMOTE+'/unsubscribe',data:{instID:instID}})
        .success(function(){
          session.updateSubscriptions();
          return next(null,null);
        })
        .error(function(){
          return next('Error unsubscribing',null);
        });
      }
    };

    return api;
  });

})();
