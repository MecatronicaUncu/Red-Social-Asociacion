/*global
	angular
*/
(function(){
	'use strict';

	angular.module('RedSocialAsociacion')
      .config(['navBarProvider',function(navBarProvider){
        navBarProvider.addTab('admin',function(session,$location){
          var translation = session.getTranslation();
          if(translation !== null){
            return {name:translation.navBar.admin, href:'#/admin', active:$location.path()==='/admin', visible:session.isAdmin()};
          }else{
            return {};
          }
        });
      }])
      .controller('AdminCtrl', function ($scope, session, $http) {
		
		if(session.getTranslation()){
			$scope.translation = session.getTranslation();
		}
		
		$scope.$on('gotTranslation',function(){
			$scope.translation = session.getTranslation();
		});

		$scope.nodeRelToCreate = {};

		$scope.nodetypes = [];
		$scope.reltypes = [];

		$scope.noderelToShow = {
			parts: [],
			rels: []
		};

		$scope.nodeNavLevels = [];
		$scope.nodeSearchResults = [];

		$scope.newRelCollapse = true;
		$scope.newNodeCollapse = true;

		$scope.newRel = {};
		$scope.newNode = {};

		$scope.nodeFields = [];

    $scope.removeRel = function(rel){
      $http({method:'POST', url:'/delnoderel', data:{
        idNEO: rel.idNEO,
        instID: $scope.nodeNavLevels[$scope.nodeNavLevels.length-1].idNEO,
        relType: rel.reltype
      }})
      .success(function(data){
        console.log(data);
        var inst = $scope.nodeNavLevels[$scope.nodeNavLevels.length-1];
				$scope.getNodeContent(inst,$scope.nodeNavLevels.length-1);
        return;
      })
      .error(function(err){
        console.log(err);
        return;
      });
    };

    $scope.removePart = function(part){
      var instID = ($scope.nodeNavLevels.length === 0)?part.idNEO:$scope.nodeNavLevels[$scope.nodeNavLevels.length-1].idNEO;
      var idNEO = ($scope.nodeNavLevels.length === 0)?session.getID():part.idNEO;
      $http({method:'POST', url:'/delnoderel', data:{
        idNEO: idNEO,
        instID: instID,
        relType: 'PARTOF'
      }})
      .success(function(data){
        var inst = $scope.nodeNavLevels[$scope.nodeNavLevels.length-1];
        if(inst){
          $scope.getNodeContent(inst,$scope.nodeNavLevels.length-1);
        }else{
          $scope.getAdminNodes();
        }
        console.log(data);
        return;
      })
      .error(function(err){
        console.log(err);
        return;
      });
    };

		$scope.newRelForm = function(reltype){
			$scope.newRelCollapse = false;
			$scope.newNodeCollapse = true;

			$scope.nodeRelToCreate = reltype;
		};

		$scope.newNodeForm = function(nodetype){
			$scope.newRelCollapse = true;
			$scope.newNodeCollapse = false;

			$scope.nodeRelToCreate = nodetype;

			$http({method:'GET', url:'/fields/'+nodetype.label})
			.success(function(data){
				console.log(data);
				$scope.nodeFields = data.fields;
				return;
			})
			.error(function(data){
				console.log('Error Getting Node Fields');
				return;
			});
		};

		$scope.selectNewRel = function(usr){
			$scope.newRel = usr;
			$scope.clearNodeSearch();
			$scope.nodeSearchResults = [];
		};

		$scope.createNewRel = function(){
			console.log($scope.newRel);
			console.log($scope.nodeRelToCreate);

			var inst = $scope.nodeNavLevels[$scope.nodeNavLevels.length-1];

			$http({method:'POST', url:'/newrel', data:{
				usrID:$scope.newRel.idNEO,
				relType:$scope.nodeRelToCreate.label,
				instId:inst.idNEO}})
			.success(function(data){
				$scope.cancelNewNodeRel();
				$scope.getNodeContent(inst,$scope.nodeNavLevels.length-2);
				return;
			})
			.error(function(){
				console.log('Error Creating Rel');
				return;
			});
		};

		$scope.createNewPart = function(){ 
			var inst = $scope.nodeNavLevels[$scope.nodeNavLevels.length-1];

			$http({method:'POST', url:'/newpart', data:{
				label:$scope.nodeRelToCreate.type,
				partData:$scope.newNode,
				instID:inst.idNEO}})
			.success(function(data){
				$scope.cancelNewNodeRel();
				$scope.getNodeContent(inst,$scope.nodeNavLevels.length-1);
				return;
			})
			.error(function(){
				console.log('Error Creating Node');
				return;
			});
		};

		$scope.relParamSelected = function(relLabel,relValue,paramIndex){
			$scope.nodeRelToCreate.relParams[paramIndex] = { label:relLabel, value:relName};
		};

		$scope.cancelNewNodeRel = function(){
			$scope.newRel = {};
			$scope.newNode = {};
			
			$scope.newRelCollapse = true;
			$scope.newNodeCollapse = true;
			
			$scope.nodeRelToCreate = {
				label: 'choose'
			};
		};

		$scope.getNodeRelTypes = function(node){
			$http({method:'GET', url:'/nodereltypes', params:{memberof:node.label}})
			.success(function(data){
				console.log(data);
				$scope.nodetypes = data.nodetypes;
				$scope.reltypes = data.reltypes;
			})
			.error(function(data){
				console.log('Error Getting NodeRel Types',data);
			});
		};

    //idx: indice en los labels de navegación
		$scope.getNodeContent = function(node,idx){

			$scope.cancelNewNodeRel();
			console.log(idx);
			if(idx >= 0){
				$scope.nodeNavLevels = $scope.nodeNavLevels.slice(0,idx); 
			}

			$http({method:'GET', url:'/nodecontents',params:{institutionID:node.idNEO}})
			.success(function(data){
				console.log(data);
				$scope.noderelToShow.parts = data.parts;
				$scope.noderelToShow.rels = data.rels;
				$scope.nodeNavLevels.push(node);
        console.log($scope.nodeNavLevels[$scope.nodeNavLevels.length-1]);

				$scope.getNodeRelTypes(node);
			})
			.error(function(data){
				console.log('Error Getting Node Contents',data);
			});
		};

		$scope.getAdminNodes = function(){

			$scope.nodeNavLevels = [];
			$scope.nodeRelToCreate = {};
			$scope.nodetypes = [];
			$scope.reltypes = [];

			$http({method:'GET', url:'/adminnodes'})
			.success(function(data){
				console.log(data.adminnodes);
				$scope.noderelToShow.rels = [];
				$scope.noderelToShow.parts = data.adminnodes;
			})
			.error(function(data){
				console.log('Error Getting Admin Nodes',data);
			});
		};

		$scope.clearNodeSearch = function(){
			$('#nodeSearchText').val('');
		};

		$scope.nodeSearch = function(){
			
			var text = $('#nodeSearchText').val();
			if (text===''){
				$scope.nodeSearchResults = [];
				return;
			}
			var path = '/search?what=Users&term='+text+'&fnm='+text+'&lnm='+text+'&prf='+text+text+'&ema='+text;
			$http({method:'GET', url:path})
			.success(function (results){
				console.log(results);
				$scope.nodeSearchResults=results;
				$scope.nodeSearchResults.forEach(function(el){
					el['link']='/usr/'+el['idNEO'].toString()+'/pic';
				}); 
			});
		};

		$scope.getAdminNodes();
	});
})();
