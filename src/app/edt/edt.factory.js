(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .factory('edt',function($http, $rootScope, session){

    var config = null;

    var setConfig = function(_config){
      config = angular.copy(_config);
      $rootScope.$broadcast('edt:gotConfig',api.getConfig());
    };

    var api = {
      getTimes: function(ids, week, year, me, next){
        $http({ method:'GET', url:'/times',
                params:{ids:ids, week:week, year:year, me:me}})
        .success(function(data){
          return next(null,data.times);
        })
        .error(function(){
          return next('Error Getting Times',null);
        });
      },
      updateConfig: function(next){
        $http({method:'GET', url:'/edtconfig'})
        .success(function(data){
          setConfig(data.config);
          return next(null,data.config);
        })
        .error(function(){
          return next('Error Getting EDT Config',null);
         });
      },
      getActivityTypes: function(parent, next){
        $http({ method:'GET', url:'/acttypes',
                params:{parent: parent}})
        .success(function(data){
          return next(null,data.activityTypes);
        })
        .error(function(err){
          return next(err);
        });
      },
      getAssociations: function(next){
        $http({method:'GET', url:'/asocs'})
        .success(function(data){
          return next(null, data.asocs);
        })
        .error(function(err){
          return next(err);
        });
      },
      /*
      getPlaces: function(next){
        $http({method:'GET', url:'/edtplaces'})
        .success(function(data){
          return next(null,data.places);
        })
        .error(function(){
          return next('Error Getting EDT Places',null);
        });
      },
      */
      newActivity: function(activities,next){
        $http({method:'POST', url:'/edtnewact', data:{activities:activities}})
        .success(function(){
          return next(null,null);
        })
        .error(function(){
          return next('Error Saving New Activities',null);
        });
      },
      getConfig: function(){
        return angular.copy(config);
      },
      mergeCalendar: function(idNEO, mergeCal, next){
          $http({method:'POST', url:'/edtmergecal', data:{idNEO:idNEO, mergeCal:mergeCal}})
          .success(function(){
              return next(null);
          })
          .error(function(){
              return next('Error Updating Merge Attribute');
          });
      }
    };

    return api;
  });
})();
