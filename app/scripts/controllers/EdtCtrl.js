'use strict';

var App = angular.module('linkedEnibApp');

App.controller('EdtCtrl', function ($scope, edt, $timeout) {
	
	$(window).on('resize', function() {					
		$scope.clearplot();
		$scope.replot();
	});
	
	$scope.edtTypes = function(){
		
		edt.getTypes(function(err,data){
			if(err){
				console.log(err);
			} else {
				console.log(data);
				$scope.items.data = data;
			}
		});
	};
	
	$scope.clearSearch = function(){
		$scope.items = {
			click: 'edtSubTypes',
			data: []
		};
		
		$scope.searchTerm = 'Elija Tipo';
		$scope.type = '';
		$scope.subtype = '';
		
		$scope.edtTypes();
	};
	
	$scope.days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

	$scope.config = {	types:	{
							Clase: {
								color:'#B1C3F9'
							},
							Plenaria: {
								color:'#9EE874'
							},
							Curso: {
								color: '#FFED70'
							},
							Examen: {
								color: '#9F8186'
							},
							TP: {
								color: '#FF8680'
							}
						},
						limits:	{
							start:'08h00',
							end:'22h00'
						}
				};				
	$scope.times = [	{	day:'Jueves',
							times: [
							{	ti:'12h30',
										tf:'13h48',
										place:'Aula 6',
										person:'Andrés Manelli',
										type:'Curso'
							},
							{	ti:'08h10',
								tf:'10h20',
								place:'Anfiteatro Oeste',
								person:'Aníbal Mirasso',
								type:'Clase'
							},
							{	ti:'08h30',
								tf:'10h00',
								place:'Anfiteatro Oeste',
								person:'Aníbal Mirasso',
								type:'Clase'
							},
							{	ti:'15h00',
								tf:'16h30',
								place:'Asociación de Mecatrónica',
								person:'Fernando Cladera',
								type:'Curso'
							},
							{	ti:'19h00',
								tf:'20h00',
								place:'Anfiteatro Este',
								person:'Susana Bernasconi',
								type:'Plenaria'
							}]
						},
						{	day:'Lunes',
							times: [	
							{	ti:'14h30',
								tf:'16h48',
								place:'Aula 10',
								person:'Alvaro Alonso',
								type:'Clase'
							},
							{	ti:'17h00',
								tf:'18h00',
								place:'Aula 1',
								person:'Gino Copparoni',
								type:'TP'
							},
							{	ti:'08h40',
								tf:'09h50',
								place:'Aula 16',
								person:'Franco Ardiani',
								type:'Plenaria'
							},
							{	ti:'18h30',
								tf:'21h50',
								place:'Asociación de Mecatrónica',
								person:'Fernando Cladera',
								type:'Curso'
							},
							{	ti:'11h00',
								tf:'11h45',
								place:'Aula 5',
								person:'Maximiliano Badaloni',
								type:'Examen'
							}]
						}];
	$scope.divs = [];
	$scope.divIndex = 0;
	$scope.lasttimes = {};
	$scope.lastconfig = {};
	$scope.suffix = 'H';
	
	$scope.getOffset = function(el){
		var _x = 0;
		var _y = 0;
		while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
			_x += el.offsetLeft - el.scrollLeft;
			_y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}
		return { top: _y, left: _x };
	};
	
	$scope.blockHTML = function(timejson,ti,tt,h,w,ttip){

		var pos,htip;
		
		if($scope.suffix=='H'){
			pos = 'right';
			htip = h - 10;
		} else {
			pos = 'bottom';
			htip = 50;
		}
		if((timejson.ti-ti) > (tt/2) ){
			if($scope.suffix=='H'){
				pos = 'left';
				htip = h - 10;
			} else {
				pos = 'top';
				htip = 50;
			}
		}
		w = Math.ceil(w);	
		var info = ['<div style="padding-left: 3px; height: 100%">',
					'<div style="height: 20%">'+timejson.type.substr(0,15)+'</div>',
					'<div style="height: 40%">'+timejson.sti+' - '+timejson.stf+'</div>',
					'<div style="height: 20%">'+timejson.person.split(' ')[0].substr(0,1)+'. '+timejson.person.split(' ')[1]+'</div>',
					'<div style="height: 20%">'+timejson.place+'</div>',
					'</div>'].join('\n');
					
		if(ttip){
			return [	'<core-tooltip show="false"; position="'+pos+'">',
						'<div style="height: '+h+'px; width: '+w+'px;"><core-icon icon="list"></core-icon></div>',
						'<div tip style="height: '+htip+'px">'+info+'</div>',
						'</core-tooltip>'].join('\n');
		} else {
			return info;
		}
	};
	
	$scope.getminutes = function(t){
		t = t.split('h');
		t = parseInt(t[0])*60 + parseInt(t[1]);
		return t;
	};
	
	$scope.clearplot = function(){

		$scope.divs.forEach(function(el){
			$('#edt * #'+el.id).remove();
		});
		
		$scope.divs=[];
		$scope.divIndex=0;
	};
	
	$scope.replot = function(){
		$scope.timeplot($scope.lasttimes, $scope.lastconfig);
	};
	// ARREGLARRRR
	$scope.togglettip = function(id){
		var div = $('#'+id+' > core-tooltip');
		if(div.prop('show') == true){
			div.prop('show',false);
		} else {
			div.prop('show',true);
		}
	};
	
	$scope.timeplot = function(alltimes, config){
		console.log(alltimes[0].times[0]);
		$scope.lasttimes=JSON.parse(JSON.stringify(alltimes));
		$scope.lastconfig=JSON.parse(JSON.stringify(config));

		var divwidth;
		var divheight;

		if($('.edt-times-h').css('display') == 'none'){
			$scope.suffix = 'V';
			divwidth = $('.edt-days').width();
			divheight = $('.chartContainerV').height();
		} else {
			$scope.suffix = 'H';
			divwidth = $('.chartContainer').width();
			divheight = $('.chartContainer').height();
		}

		console.log(divwidth+'  '+divheight);

		//	Transform times
		var start = $scope.getminutes(config.limits.start);
		var end = $scope.getminutes(config.limits.end);
		var tt = end - start;

		alltimes.forEach(function(el){
			var id = el.day+$scope.suffix;
			console.log('ID: '+id);
			var times = el.times;
			//	Transform times
			times.forEach(function(el){
				el.sti = el.ti;
				el.stf = el.tf;
				el.ti = $scope.getminutes(el.ti);
				el.tf = $scope.getminutes(el.tf);
			});
			
			times.sort(function(a, b){
				return a.ti - b.ti;
			});
			
			if($scope.suffix=='H'){	
				times.forEach(function(el){
					var x = ((el.ti-start)/tt)*divwidth;
					var w = ((el.tf - el.ti)/tt)*divwidth;
					$scope.divs[$scope.divIndex] = document.createElement('div');
					$scope.divs[$scope.divIndex].id = 'ttip-'+id+$scope.divIndex;
					$($scope.divs[$scope.divIndex]).css('position','absolute');
					$($scope.divs[$scope.divIndex]).css('left', x);
					$($scope.divs[$scope.divIndex]).css('width', w);
					$($scope.divs[$scope.divIndex]).css('height',divheight);
					$($scope.divs[$scope.divIndex]).css('background-color', config.types[el.type].color);
					if(w >= 85){
						$($scope.divs[$scope.divIndex]).append($scope.blockHTML(el,start,tt,divheight,w,false));
						$scope.divs[$scope.divIndex].className += ' edt-block-info';
					} else {
						$($scope.divs[$scope.divIndex]).append($scope.blockHTML(el,start,tt,divheight,w,true));
					}
					//ARREGLAR EL CLICK
					$($scope.divs[$scope.divIndex]).click({id: $scope.divs[$scope.divIndex].id, ctx:$scope},$scope.togglettip);			
					document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
					$scope.divIndex++;
					//TODO: new row if superposition found
				});
			} else {
				console.log('VERTICAL');
				var top = 0;
				var hcum = 0;
				times.forEach(function(el){
					var y = ((el.ti-start)/tt)*divheight;
					var h = ((el.tf - el.ti)/tt)*divheight;
					top = y-hcum;
					console.log('y '+y+' h '+h);
					$scope.divs[$scope.divIndex] = document.createElement('div');
					$scope.divs[$scope.divIndex].id = 'ttip-'+id+$scope.divIndex;
					$($scope.divs[$scope.divIndex]).css('position','relative');
					$($scope.divs[$scope.divIndex]).css('top', top+'px');
					$($scope.divs[$scope.divIndex]).css('width', '100%');
					$($scope.divs[$scope.divIndex]).css('height',h+'px');
					$($scope.divs[$scope.divIndex]).css('background-color', config.types[el.type].color);
					if(h >= 70){
						$($scope.divs[$scope.divIndex]).append($scope.blockHTML(el,start,tt,h,divwidth,false));
						$scope.divs[$scope.divIndex].className += ' edt-block-info';
					} else {
						$($scope.divs[$scope.divIndex]).append($scope.blockHTML(el,start,tt,h,divwidth,true));
					}	
					//ARREGLAR EL CLICK
					$($scope.divs[$scope.divIndex]).click({id: $scope.divs[$scope.divIndex].id, ctx:$scope},$scope.togglettip);	
					document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
					$scope.divIndex++;
					hcum+=h;
					//TODO: new row if superposition found
				});
			}
		});
	};
	
	//ARREGLAR
	$scope.showTimesV = function(event) {
		//$('#'+sender.id+'Collapse').toggle();
		console.log(event);
	};
		
	$scope.edtSubTypes = function(item){
		
		$scope.type = item.name;
		$scope.searchTerm = 'Elija '+item.name; 
		edt.getSubTypes($scope.type, function(err,data){
			if(err){
				console.log(err);
			} else {
				console.log(data);
				$scope.items.data = data;
				$scope.items.click = 'edtGetTimes';
			}
		});
	};
	
	$scope.edtGetTimes = function(item){
		console.log('EDT GET TIMES');
		console.log(item);
	};
	
	$scope.$on('$viewContentLoaded', function () {
		/* Como los ids de la tabla del EDT se generan dinámicamente en un ng-repeat,
		 * el documento tarda un tiempo en verlos. Deberia haber un evento como $viewContentLoaded
		 * que indique cuándo están accesibles. O se debería cambiar la forma en que está hecho el EDT.
		 * Por el momento hacer un delay funciona...
		 */
		$timeout(function(){
			$scope.clearSearch();
			$scope.timeplot($scope.times,$scope.config);
		}, 200);
	});
	
});
