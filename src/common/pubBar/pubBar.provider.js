(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .provider('pubBar',[function pubBarProvider(){

      var pubs = {};

      return {

        addPub: function(name,contents){
          if(pubs.hasOwnProperty(name)){
            return;
          }
          pubs[name] = angular.copy(contents);
        },
        $get: [function pubBarFactory(){
          var api = {
            getPubs: function(){
              var p = [];
              for(var name in pubs){
                if(pubs.hasOwnProperty(name)){
                  p.push(pubs[name]);
                }
              }
              return p;
            }
          };

          return api;
        }]
      };
    }]);

})();
