(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .factory('edt',function($http, $rootScope, session){

    var config = null;

    var setConfig = function(_config){
      config = angular.copy(_config);
      $rootScope.$broadcast('edt:gotConfig',api.getConfig());
    };

    var api = {
      getTimes: function(whatId, whoId, week, year, next){
        $http({ method:'GET', url:'/times',
                params:{whatId:whatId, whoId:whoId, week:week, year:year}})
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
          console.log(data.config);
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
          console.log(data.activityTypes);
          return next(null,data.activityTypes);
        })
        .error(function(err){
          return next(err);
        });
      },
      getAssociations: function(next){
        $http({method:'GET', url:'/asocs'})
        .success(function(data){
          console.log(data.asocs);
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
      }
    };

    return api;
  });
})();
