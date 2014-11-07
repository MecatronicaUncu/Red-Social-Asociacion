'use strict';

var App = angular.module('linkedEnibApp');

App.controller('EdtCtrl', function ($scope, edt, session, $timeout) {
	
	$(window).on('resize', function() {			
		if($scope.newActCollapse){
			$scope.clearplot();
			$scope.replot();
		}
	});

	$scope.newActCollapse = true;
	$scope.divs = [];
	$scope.divIndex = 0;
	$scope.lasttimes = {};
	$scope.lastconfig = {};
	$scope.suffix = 'H';
	$scope.session = session;
	
	$scope.DobToYWDarr = function(DArg) {
		var DOb = new Date(DArg); // <- errors with Opera 9
		if (isNaN(DOb)) 
			return false;
		var D = DOb.getDay();
		if (D==0)
			D=7; // D = ISO DoW
		DOb.setDate(DOb.getDate() + (4-D));   // To nearest Thu, mid-week
		var YN = DOb.getFullYear();           // YN = ISO W-N Year
		// uses Jan 1 of YN; -6h allows for Summer Time
		var ZBDoCY = Math.floor( (DOb.getTime() - new Date(YN, 0, 1, -6)) / 864e5 );
		var WN = 1 + Math.floor(ZBDoCY/7);

		return [YN, WN, D] /* ISO 8601 */
	};

	$scope.YWDarrToDob = function(AYWD) { // Arg : ISO 8601 : [Y, W, D]
		var DOb = new Date(+AYWD[0], 0, 3);  // Jan 3
		if (isNaN(DOb))
			return false;
		DOb.setDate( 3 - DOb.getDay() + (AYWD[1]-1)*7 + +AYWD[2] );
		return DOb;
	};

	/*	Devuelve el número de semanas en este año
	 *
	 */
	$scope.weeksInYear = function() {
  		var d = new Date((new Date()).getFullYear(), 11, 31);
  		var week = $scope.DobToYWDarr(d)[1];
  		return week == 1? $scope.DobToYWDarr(d.setDate(24))[1] : week;
	};

	/*	Para una semana data como parámetro, o para la semana actual si es omitido,
	 *	guarda los strings correspondientes a las fechas de esa semana.
	 */
	$scope.setDates = function(w){

		// No importa el Day Of Week en week, porque al iterar se sobreescribe
		var week = (w?[(new Date()).getFullYear(),w,0]:$scope.DobToYWDarr(new Date()));

		$scope.thisWeek = week[1];

		$scope.days.forEach(function(el,index){
			var jour = $scope.YWDarrToDob([week[0],week[1],index+1]);
			var d = jour.getDate();
			var m = (jour.getMonth()+1);
			var y = jour.getFullYear();
			el.date = (d<10?'0':'')+d+'-'+(m<10?'0':'')+m+'-'+y;
		});

		//TODO: PLOTEAR ACA.
	}

	$scope.edtAllTypes = function(){
		
		edt.getAllTypes(function(err,data){
			if(err){
				console.log(err);
			} else {
				$scope.items.data = data;
			}
		});
	};
	
	$scope.clearSearch = function(){
		$scope.items = {
			click: 'edtSubTypes',
			data: []
		};
		
		$scope.setDates();

		$scope.searchTerm = 'Elija Tipo';
		$scope.searchIcon = 'fa-question-circle';
		$scope.type = '';
		$scope.subtype = '';
		$scope.newActCollapse = true;

		$scope.edtAllTypes();
	};
	
	$scope.days = [{name:'Lunes',
					date:''
				},
				{	name:'Martes',
					date:''
				},
				{	name:'Miércoles',
					date:''
				},
				{	name:'Jueves',
					date:''
				},
				{	name:'Viernes',
					date:''
				},
				{	name:'Sábado',
					date:''
				}];

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
		if((timejson.mti-ti) > (tt/2) ){
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
					'<div style="height: 40%">'+timejson.ti+' - '+timejson.tf+'</div>',
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
		var mt = t.split('h');
		mt = parseInt(mt[0])*60 + parseInt(mt[1]);
		return mt;
	};
	
	$scope.clearplot = function(){

		$scope.divs.forEach(function(el){
			$('#edt * #'+el.id).remove();
		});
		
		$scope.divs=[];
		$scope.divIndex=0;
	};
	
	$scope.replot = function(){
		$scope.timeplot($scope.times, $scope.config);
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
				el.mti = $scope.getminutes(el.ti);
				el.mtf = $scope.getminutes(el.tf);
			});
			
			times.sort(function(a, b){
				return a.mti - b.mti;
			});
			
			if($scope.suffix=='H'){	
				times.forEach(function(el){
					var x = ((el.mti-start)/tt)*divwidth;
					var w = ((el.mtf - el.mti)/tt)*divwidth;
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
					var y = ((el.mti-start)/tt)*divheight;
					var h = ((el.mtf - el.mti)/tt)*divheight;
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
		$scope.searchIcon = item.icon;
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
	
	$scope.edtGetTimes = function(item, week){
		console.log('EDT GET TIMES');
		$scope.searchTerm = item.name;
		console.log(item);
		edt.getTimes(item.name,week,function(err,times){
			if(err){
				console.log(err);
			} else {
				console.log('EDT GET TIMES: ');
				console.log(times);
			}
		});
	};
	
	$scope.edtGetConfig = function(){

		edt.getConfig(function(err,config){
			if(err){
				console.log(err);
			} else {
				console.log('EDT GET CONFIG: ');
				console.log(config);
				$scope.config.limits = config.limits;
				$scope.config.mongoTypes = config.types;
				$scope.actTypes = $scope.config.mongoTypes;
				$scope.newActType = $scope.actTypes[0];
				config.types.forEach(function(el){
					($scope.config.types[el.name] = new Object()).color = el.color;
				});
				console.log($scope.config);
				$scope.timeplot($scope.times, $scope.config);
			}
		});
	};

	$scope.newActSubCats = function(cat){

		$scope.newActCat = cat;

		edt.getSubTypes(cat.name,function(err,data){

			if(err){
				console.log(err);
			} else {
				$scope.actSubCats = data;
				$scope.newActSubCat = $scope.actSubCats[0];
			}
		});
	};

	$scope.checkTimes = function(){

		var msg=null;
		if($scope.getminutes($scope.newAct.ti) < $scope.getminutes($scope.config.limits.start)){
			msg = 'La hora inicial no puede ser anterior al inicio general! ('
				+$scope.config.limits.start+')';
		} else if ($scope.getminutes($scope.newAct.tf) > $scope.getminutes($scope.config.limits.end)) {
			msg = 'La hora final no puede ser posterior al fin general! ('
				+$scope.config.limits.end+')';
		} else if ($scope.getminutes($scope.newAct.ti) > $scope.getminutes($scope.newAct.tf)) {
			msg = 'La hora inicial no puede ser posterior que la final!';
		} else {
			$('#WrongAct').prop('hidden',true);
			return false;
		}
		
		if(msg){
			$('#WrongAct').text(msg).prop('hidden',false);
			return true;
		} else {
			$('#WrongAct').prop('hidden',true);
			return false;
		}
	}

	$scope.newActivity = function(newAct){

		console.log(newAct);
		if($scope.checkTimes()){
			return;
		} else {
			var day = $('#newActWhen').datepicker('getDate').getDate();  
			var month = $('#newActWhen').datepicker('getDate').getMonth();  
			var year = $('#newActWhen').datepicker('getDate').getFullYear(); 
			var date = $scope.DobToYWDarr(new Date(year,month,day));
			$scope.newAct.when = {year:date[0],week:date[1],day:date[2]};
			$scope.newAct.whoID = session.getId();
			$scope.newAct.who = session.getUserName();
			console.log($scope.newAct);

		}
		//$scope.newActCollapse =! $scope.newActCollapse;
	}

	$scope.minutes2Str = function(minutes){
		var h = Math.floor(minutes/60);
		var m = minutes-h*60;

		return (h<10?'0'+h:h)+'h'+(m<10?'0'+m:m);
	}

	$scope.calcTime = function(){


		if($('#newActStart').parsley().isValid() && $('#newActDur').parsley().isValid(true)){
			var start = $scope.getminutes($scope.newAct.ti);
			var dur = $scope.getminutes($scope.newAct.dur);
			var end = start+dur;
			end = $scope.minutes2Str(end);
			$scope.newAct.tf = end;

			if($scope.checkTimes()){$scope.newAct.tf = ''};
		} else if($('#newActStart').parsley().isValid() && $('#newActEnd').parsley().isValid()){
			var start = $scope.getminutes($('#newActStart').val());
			var end = $scope.getminutes($('#newActEnd').val());
			var dur = end-start;
			dur = $scope.minutes2Str(dur);
			$scope.newAct.dur = dur;

			if($scope.checkTimes()){$scope.newAct.dur = ''};
		} else if($('#newActDur').parsley().isValid(true) && $('#newActEnd').parsley().isValid()){
			var dur = $scope.getminutes($('#newActDur').val());
			var end = $scope.getminutes($('#newActEnd').val());
			var start = end-dur;
			start = $scope.minutes2Str(start);
			$scope.newAct.ti = start;

			if($scope.checkTimes()){$scope.newAct.ti = ''};
		}
	}

	$scope.clearAct = function(){

		$('#newActForm * input').val('');
	}

	$scope.$on('$viewContentLoaded', function () {
		$scope.clearSearch();

		/* Como los ids de la tabla del EDT se generan dinámicamente en un ng-repeat,
		 * el documento tarda un tiempo en verlos. Deberia haber un evento como $viewContentLoaded
		 * que indique cuándo están accesibles. O se debería cambiar la forma en que está hecho el EDT.
		 * Por el momento hacer un delay funciona...
		 */
		$timeout(function(){
			/*	Cargar las semanas en el año, sólo una vez al cargar el controlador
			 */
			var wn = $scope.weeksInYear();
			var i;
			$scope.weeks = [];
			for(i=1;i<=wn;i++){
				$scope.weeks.push(i);
			};

			$('#edt').prop('hidden',false);
			$('#newActWhen').datepicker({minDate: 0});
			// No sé porqué pero es muy necesario hacer esto.
			$('.ui-datepicker').css('margin-top', '0px');

			/* 	TODO:
			 *	mongoTypes usado para el menú desplegable en edt.html,
			 *	types usado para el plot, que busca según types[el.name]
			 * 	Se debería solucionar esta diferencia
			 */
			$scope.config = { limits: {}, types: {}, mongoTypes: {}};
			$scope.edtGetConfig();

			edt.getTypes('Activity',function(err,data){
				if(err){
					console.log('Error Getting Activities Types');
				} else {
					$scope.actCats = data;
					$scope.newActCat = $scope.actCats[0];
					$scope.newActSubCats($scope.newActCat);
				}
			});

			$scope.newAct = {};

		}, 200);
	});
	
});
