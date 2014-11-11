'use strict';

var App = angular.module('linkedEnibApp');

App.controller('EdtCtrl', function ($scope, edt, session, $timeout) {
	
	$(window).on('resize', function() {
		console.log($scope.newActCollapse);
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

		$scope.searchWeek = week[1];

		$scope.days.forEach(function(el,index){
			var jour = $scope.YWDarrToDob([week[0],week[1],index+1]);
			var d = jour.getDate();
			var m = (jour.getMonth()+1);
			var y = jour.getFullYear();
			el.date = (d<10?'0':'')+d+'/'+(m<10?'0':'')+m+'/'+y;
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
	
	$scope.actRepeats = [	{name:'Cada semana', value:'pw'},
							{name:'Semana próxima', value:'nw'},
							{name:'Cada dos semanas', value:'2w'},
							{name:'Nunca', value:'n'}]

	$scope.days = [{name:'Lunes',
					date:'',
					collapsed: true
				},
				{	name:'Martes',
					date:'',
					collapsed: true
				},
				{	name:'Miércoles',
					date:'',
					collapsed: true
				},
				{	name:'Jueves',
					date:'',
					collapsed: true
				},
				{	name:'Viernes',
					date:'',
					collapsed: true
				},
				{	name:'Sábado',
					date:'',
					collapsed: true
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
	
	$scope.blockHTML = function(timejson){
	
		//w = Math.ceil(w);	
		var info = ['<div style="padding-left: 3px; height: 100%">',
					'<div style="height: 20%">'+timejson.type.substr(0,15)+'</div>',
					'<div style="height: 40%">'+timejson.ti+' - '+timejson.tf+'</div>',
					'<div style="height: 20%">'+timejson.person.split(' ')[0].substr(0,1)+'. '+timejson.person.split(' ')[1]+'</div>',
					'<div style="height: 20%">'+timejson.place+'</div>',
					'</div>'].join('\n');
		/*			
		if(ttip){
			return [	'<core-tooltip show="false"; position="'+pos+'">',
						'<div style="height: '+h+'px; width: '+w+'px;"><core-icon icon="list"></core-icon></div>',
						'<div tip style="height: '+htip+'px">'+info+'</div>',
						'</core-tooltip>'].join('\n');
		} else {
			return info;
		}*/
		return info;
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
			
			var pos,htip;
		
			if($scope.suffix=='H'){	
				pos = 'right center';
				//htip = h - 10;

				if((el.mti-start) > (tt/2) ){
					pos = 'left center';
					//htip = h - 10;
				}

				times.forEach(function(el){
					var x = ((el.mti-start)/tt)*divwidth;
					var w = ((el.mtf - el.mti)/tt)*divwidth;
					$scope.divs[$scope.divIndex] = document.createElement('div');
					$scope.divs[$scope.divIndex].id = 'ttip-'+id+$scope.divIndex;
					$scope.divs[$scope.divIndex].title = "";
					$($scope.divs[$scope.divIndex]).css('position','absolute');
					$($scope.divs[$scope.divIndex]).css('left', x);
					$($scope.divs[$scope.divIndex]).css('width', w);
					$($scope.divs[$scope.divIndex]).css('height',divheight);
					$($scope.divs[$scope.divIndex]).css('background-color', config.types[el.type].color);
					if(w >= 85){
						$($scope.divs[$scope.divIndex]).append($scope.blockHTML(el));
						$scope.divs[$scope.divIndex].className += ' edt-block-info';
					} else {
						$scope.divs[$scope.divIndex].className += ' edt-ttip';
						$($scope.divs[$scope.divIndex]).tooltip({
							position: {
								at: pos,
								collision: 'none'
							},
							content: $scope.blockHTML(el)
						});
					}
					document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
					$scope.divIndex++;
					//TODO: new row if superposition found
				});
			} else {
				pos = 'center bottom';
				htip = 50;

				if((el.mti-start) > (tt/2) ){
					pos = 'center top';
					htip = 50;
				}

				console.log('VERTICAL');
				var top = 0;
				var hcum = 0;
				times.forEach(function(el,index){
					var y = ((el.mti-start)/tt)*divheight;
					var h = ((el.mtf - el.mti)/tt)*divheight;
					top = y-hcum;
					console.log('y '+y+' h '+h);
					$scope.divs[$scope.divIndex] = document.createElement('div');
					$scope.divs[$scope.divIndex].id = 'ttip-'+id+$scope.divIndex;
					$($scope.divs[$scope.divIndex]).css('position','relative');
					if(index==0){$($scope.divs[$scope.divIndex]).css('top', top+'px');}
					$($scope.divs[$scope.divIndex]).css('width', '100%');
					$($scope.divs[$scope.divIndex]).css('height',h+'px');
					$($scope.divs[$scope.divIndex]).css('background-color', config.types[el.type].color);
					if(h >= 70){
						$($scope.divs[$scope.divIndex]).append($scope.blockHTML(el));
						$scope.divs[$scope.divIndex].className += ' edt-block-info';
					} else {
						$scope.divs[$scope.divIndex].className += ' edt-ttip';
						$($scope.divs[$scope.divIndex]).tooltip({
							position: {
								at: pos,
								collision: 'none'
							},
							content: $scope.blockHTML(el)
						});
					}	
					document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
					$scope.divIndex++;
					hcum+=h;
					//TODO: new row if superposition found
				});
				
				$('.edt-ttip').off( "mouseover" ).click(function(){
					$(this).tooltip('open');
				}).off("mouseout");
			}
		});
	};
	
	//ARREGLAR
	$scope.showTimesV = function(day) {
		$scope.days[day].collapsed = !$scope.days[day].collapsed;
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

		edt.getConfig('',function(err,config){
			if(err){
				console.log(err);
			} else {
				console.log('EDT GET CONFIG: ');
				console.log(config);
				$scope.config.limits = config.limits;
				$scope.config.mongoTypes = config.types;
				config.types.forEach(function(el){
					($scope.config.types[el.name] = new Object()).color = el.color;
				});
				console.log($scope.config);
				$scope.timeplot($scope.times, $scope.config);
			}
		});
	};

	$scope.newActRepeatTo = function(strDate){
		var date = strDate.split('/');
		var day  = date[0];  
		// month - 1 porque en formato ISO el mes es de 0 a 11
		var month = date[1] - 1;  
		var year = date[2]; 

		date = new Date(year,month,day);
		date = $scope.DobToYWDarr(date);

		$scope.newAct.toWhen = {year:date[0],week:date[1],day:date[2]};
	}

	$scope.newActSelectRepeat = function(repeat){
		$scope.newActRepeat = repeat;
		$scope.newAct.repeat = repeat.value;

		/* 	Para llenar el valor del input. Podria usarse $('#newActWhen').val($scope.today);
		 *	No se llama a 'onSelect'
		 */
		var ref = $scope.newAct.when;
		var date = $scope.YWDarrToDob([ref.year,ref.week+1,ref.day]);
		$('#newActToWhen').datepicker('setDate', date);

		/* 	Para que se carguen los valores en $scope.newAct.toWhen.* ; 
		 *	
		 */
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		date = (d<10?'0':'')+d+'/'+((parseInt(m)+1)<10?'0':'')+(parseInt(m)+1)+'/'+y;
		$scope.newActRepeatTo(date);
	};

	$scope.newActSelectActWhere = function(place){
		$scope.newAct.where = place.name;
	}

	$scope.newActSelectActType = function(type){
		$scope.newAct.actType = type.name;
	};

	$scope.newActSelectSubCats = function(subcat){
		$scope.newAct.what = subcat.name;
	};

	$scope.newActSubCats = function(cat){

		// Guardar la elección. Importante!
		$scope.newAct.type = cat.name;

		edt.getConfig(cat.name, function(err,data){
			if(err){
				console.log(err);
			} else {
				$scope.actTypes = data.types;
				$scope.newAct.actType = $scope.actTypes[0].name;
			}
		});

		edt.getSubTypes(cat.name,function(err,data){

			if(err){
				console.log(err);
			} else {
				$scope.actSubCats = data;
				$scope.newAct.what = $scope.actSubCats[0].name;
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

	$scope.newActWhen = function(strDate){
		var date = strDate.split('/');
		var day  = date[0];  
		// month - 1 porque en formato ISO el mes es de 0 a 11
		var month = date[1] - 1;  
		var year = date[2]; 

		date = new Date(year,month,day);
		$('#newActToWhen').datepicker( "option", "minDate", date);
		date = $scope.DobToYWDarr(date);
		$scope.newAct.when = {year:date[0],week:date[1],day:date[2]};

		//Auto completar toWhen
		$scope.newActSelectRepeat($scope.newActRepeat);
	};

	$scope.newActivity = function(newAct){

		if($scope.checkTimes()){
			return;
		} else {
			// var day = $('#newActWhen').datepicker('getDate').getDate();  
			// var month = $('#newActWhen').datepicker('getDate').getMonth();  
			// var year = $('#newActWhen').datepicker('getDate').getFullYear(); 
			// var date = $scope.DobToYWDarr(new Date(year,month,day));
			// $scope.newAct.when = {year:date[0],week:date[1],day:date[2]};
			$scope.newAct.whoID = session.getId();
			$scope.newAct.who = session.getUserName();
			console.log($scope.newAct);

		}
	}

	$scope.minutes2Str = function(minutes){
		var h = Math.floor(minutes/60);
		var m = minutes-h*60;

		return (h<10?'0'+h:h)+'h'+(m<10?'0'+m:m);
	}

	$scope.correctTime = function(el){
	    
	    var matches = /([0-2]{0,1})([0-9]{0,1})(h{0,1})([0-5]{0,1})([0-9]{0,1})/g.exec($scope.newAct[el]);
	    if(matches[1] == ''){
	    	$scope.newAct[el] = '';
	    }else if(matches[2] == '' || parseInt(matches[1]+''+matches[2]) > 23){
	    	$scope.newAct[el] = matches[1];
	    }else if(matches[4] == '' ){
	    	$scope.newAct[el] = matches[1]+''+matches[2]+'h';
	    }else if(matches[5] == ''){
	    	$scope.newAct[el] = matches[1]+''+matches[2]+'h'+''+matches[4];
	    }else if(matches[5] != ''){
	    	$scope.newAct[el] = matches[1]+''+matches[2]+'h'+''+matches[4]+''+matches[5];
	    	return true;
	    	//Desabilitar input?
	    }

	    return false;
	};

	$scope.calcTime = function(el){

		if($scope.correctTime(el)){

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

			// Si no está definido no se pueden crear los campos al vuelo
			$scope.newAct = {};
			$scope.actCats = {};
			// Si no está definido al datepicker no le gusta
			$scope.newAct.when = {};
			$scope.newAct.toWhen = {};

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
					$scope.newAct.type = $scope.actCats[0].name;
					$scope.newActSubCats($scope.newAct.type);
				}
			});

			edt.getPlaces(function(err,data){
				if(err){
					console.log(err);
				} else {
					$scope.actPlaces = data;
					$scope.newAct.where = $scope.actPlaces[0].name;
				}
			});

			/*	Cargar las semanas en el año, sólo una vez al cargar el controlador
			 */
			var wn = $scope.weeksInYear();
			var i;
			$scope.weeks = [];
			for(i=1;i<=wn;i++){
				$scope.weeks.push(i);
			};

			var ajd = new Date();
			var d = ajd.getDate();
			var m = ajd.getMonth();
			var y = ajd.getFullYear();
			$scope.today = (d<10?'0':'')+d+'/'+((parseInt(m)+1)<10?'0':'')+(parseInt(m)+1)+'/'+y;
			$scope.thisWeek = $scope.DobToYWDarr($scope.today)[1];

			$scope.newActRepeat = $scope.actRepeats[3]; // = Nunca !
			$scope.newAct.repeat = $scope.newActRepeat.value;

			$('#edt').prop('hidden',false);
			$('#newActWhen').datepicker({	minDate: 0,
											showWeek: true,
											dateFormat:'dd/mm/yy',
											defaultDate: 0,
											firstDay: 1,
											onSelect: $scope.newActWhen
											});
			/* 	Para llenar el valor del input. Podria usarse $('#newActWhen').val($scope.today);
			 *	No se llama a 'onSelect'
			 */
			$('#newActWhen').datepicker('setDate', new Date());
			$('#newActToWhen').datepicker({	showWeek: true,
											dateFormat:'dd/mm/yy',
											firstDay: 1,
											beforeShowDay : function (date) {
												var rep = $scope.newActRepeat.value;
												var ref = $scope.newAct.when;
												date = $scope.DobToYWDarr(date);
												// Nunca repetir o el DoW no es el mismo
												if(rep === 'n' || date[2] != ref.day){
													return [false];
												} else if(rep === 'pw'){
													// week check
        											return [true];
        										} else if(rep === 'nw'){
        											// Solo la semana siguiente
        											return [((date[1]-ref.week) == 1) && (parseInt(date[2]) == ref.day)];
        										} else if(rep === '2w'){
        											// Cada dos semanas
        											return [(date[1]-ref.week)%2 == 0];
        										}
    										},
    										onSelect: $scope.newActRepeatTo
    										//minDate seteada en $scope.newActWhen()
			});
			/* 	Para que se carguen los valores en $scope.newAct.when.* ; 
			 *	Hay que llamarlo después de crear el $('#newActToWhen').datepicker();
			 */
			$scope.newActWhen($scope.today);

			// No sé porqué pero es muy necesario hacer esto.
			$('.ui-datepicker').css('margin-top', '0px');

		}, 200);
	});
	
});
