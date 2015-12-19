(function(){

  'use strict';

  angular.module('linkedEnibApp')
    .config(['pubBarProvider',function(pubBarProvider){
      pubBarProvider.addPub('fing',{src: 'assets/images/pub/pubFING.png',link:'https://fing.uncu.edu.ar', alt: 'fing'});
      pubBarProvider.addPub('uncuyo',{src: 'assets/images/pub/pubUNCUYO.jpg', link: 'https://www.uncu.edu.ar', alt: 'uncuyo'});
      pubBarProvider.addPub('enib',{src: 'assets/images/pub/pubENIB.jpg', link: 'https://www.enib.fr', alt: 'enib'});
      pubBarProvider.addPub('mecuncu',{src: 'assets/images/pub/pubMECUNCU.jpg', link: 'https://mecatronicauncu.org', alt: 'mecuncu'});
    }])
    .controller('PubBarCtrl',['$scope','pubBar',function($scope,pubBar){

      $scope.pubs = pubBar.getPubs();
    }]);
})();
