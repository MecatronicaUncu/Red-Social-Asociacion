(function(){

  'use strict';

  angular.module('RedSocialAsociacion')
    .provider('navBar',[function navBarProvider(){

      var tabs = {};

      return {

        addTab: function(name,contents){
          if(tabs.hasOwnProperty(name)){
            return;
          }
          tabs[name] = contents;
        },
        $get: ['session','$location',function navbarFactory(session,$location){
          var api = {
            getTabs: function(){
              var t = [];
              for(var name in tabs){
                if(tabs.hasOwnProperty(name)){
                  t.push(tabs[name](session,$location));
                }
              }
              return t;
            }
          };

          return api;
        }]
      };
    }]);

})();
