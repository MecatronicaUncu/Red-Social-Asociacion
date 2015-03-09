'use strict';

var App = angular.module('linkedEnibApp');

App.controller('AdminCtrl', function ($scope, session, $http) {
	
    if(session.translation){
        $scope.translation = session.translation;
    }
    
    $scope.$on('gotTranslation',function(){
        $scope.translation = session.translation;
    });
    
    $scope.translation = session.translation;
    
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

	$scope.newRelForm = function(reltype){
		$scope.newRelCollapse = false;
		$scope.newNodeCollapse = true;
		
		$scope.nodeRelToCreate = reltype;
	};
	
	$scope.newNodeForm = function(nodetype){
		$scope.newRelCollapse = true;
		$scope.newNodeCollapse = false;
		
		$scope.nodeRelToCreate = nodetype;
		
		$http({method:'GET', url:session.host+':3000/fields/'+nodetype.label})
        .success(function(data){
            console.log(data);
            $scope.nodeFields = data.formFields;
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
        
        $http({method:'POST', url:session.host+':3000/newrel', data:{usrID:$scope.newRel.idNEO,
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
        
        $http({method:'POST', url:session.host+':3000/newpart', data:{label:$scope.nodeRelToCreate.label,
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
        $http({method:'GET', url:session.host+':3000/nodereltypes', params:{memberof:node.label}})
        .success(function(data){
            console.log(data);
            $scope.nodetypes = data.nodetypes;
            $scope.reltypes = data.reltypes;
        })
        .error(function(data){
        	console.log('Error Getting NodeRel Types',data);
        });
	};

	$scope.getNodeContent = function(node,idx){
		
        $scope.cancelNewNodeRel();
        console.log(idx);
        if(idx >= 0)
            $scope.nodeNavLevels = $scope.nodeNavLevels.slice(0,idx); 
		
		$http({method:'GET', url:session.host+':3000/nodecontents',params:{institutionID:node.idNEO}})
        .success(function(data){
            console.log(data);
            $scope.noderelToShow.parts = data.parts;
			$scope.noderelToShow.rels = data.rels;
			$scope.nodeNavLevels.push(node);
			
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
        
		$http({method:'GET', url:session.host+':3000/adminnodes'})
        .success(function(adminnodes){
            console.log(adminnodes);
            $scope.noderelToShow.rels = [];
            $scope.noderelToShow.parts = adminnodes;
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
        var path = session.host+':3000/search?what=Users&term='+text+'&fnm='+text+'&lnm='+text+'&prf='+text+text+'&ema='+text;
        $http({method:'GET', url:path})
            .success(function (results){
            	console.log(results);
                $scope.nodeSearchResults=results;
                $scope.nodeSearchResults.forEach(function(el){
                    el['link']=session.host+':3000/usr/'+el['idNEO'].toString()+'/pic';
                }); 
        });
    };
	
	$scope.getAdminNodes();
	
	// /**
	 // * Para que las franjas horarias se adapten automáticamente.
	 // */
	// $(window).on('resize', function() {
		// if($scope.newActCollapse){
			// $scope.clearplot();
			// $scope.replot();
		// }
	// });
// 
	// /** @type {Boolean} Decide si se muestra el EDT o el form de nueva actividad */
	// $scope.newActCollapse = true;
	// /** @type {Array} Guarda las <div>s que muestran las frajas horarias para poder eliminarlas */
	// $scope.divs = [];
	// /** @type {Integer} Usado para referenciar un <div> en timeplot() */
	// $scope.divIndex = 0;
	// /** @type {String} Sufijo usado para elegir entre las <div>s contenedoras
	 // * 	horizontales o verticales
	 // */
	// $scope.suffix = 'H';
	// /**
	 // * Referencia para usarlo en edt.html para mostrar u ocultar el botón de nueva actividad
	 // * @type {Service}
	 // *
	 // * TODO: Tal vez sea mejor manejarlo via una variable del $scope
	 // * y no con el servicio directamente?
	 // */
	// $scope.session = session;
// 	
	// /**
	 // * Convierte un objeto de tipo Date en un array [Year,Week,DayOfWeek], normalizado según ISO 8601
	 // * @param {Date Object} DArg
	 // * @return {Array} [YN, WN, D]
	 // */
	// $scope.DobToYWDarr = function(DArg) {
		// var DOb = new Date(DArg); // <- errors with Opera 9
		// if (isNaN(DOb)) 
			// return false;
		// var D = DOb.getDay();
		// if (D==0)
                    // D=7; // D = ISO DoW
		// DOb.setDate(DOb.getDate() + (4-D));   // To nearest Thu, mid-week
		// var YN = DOb.getFullYear();           // YN = ISO W-N Year
		// // uses Jan 1 of YN; -6h allows for Summer Time
		// var ZBDoCY = Math.floor( (DOb.getTime() - new Date(YN, 0, 1, -6)) / 864e5 );
		// var WN = 1 + Math.floor(ZBDoCY/7);
// 
		// return [YN, WN, D]; /* ISO 8601 */
	// };
// 
	// /**
	 // * Convierte un array de tipo [Year, Week, DayOfWeek] (ISO 8601) en un objeto de tipo Date
	 // * @param {Array} AYWD ([Year, Week, DayOfWeek])
	 // * @return {Date Object} Dob
	 // */
	// $scope.YWDarrToDob = function(AYWD) { // Arg : ISO 8601 : [Y, W, D]
		// var DOb = new Date(+AYWD[0], 0, 3);  // Jan 3
		// if (isNaN(DOb))
			// return false;
		// DOb.setDate( 3 - DOb.getDay() + (AYWD[1]-1)*7 + +AYWD[2] );
		// return DOb;
	// };
// 
	// /**
	 // * Devuelve el número de semanas en el presente año
	 // * @return {Integer} week
	 // */
	// $scope.weeksInYear = function() {
  		// var d = new Date((new Date()).getFullYear(), 11, 31);
  		// var week = $scope.DobToYWDarr(d)[1];
  		// return week == 1? $scope.DobToYWDarr(d.setDate(24))[1] : week;
	// };
// 
	// /**
	 // * Para una semana dada como parámetro, o para la semana actual si es
	 // * omitido,	guarda los strings correspondientes a las fechas de esa semana.
	 // * @param {Integer} w
	 // */
	// $scope.setDates = function(w){
// 
		// // No importa el Day Of Week en week, porque al iterar se sobreescribe
		// var week = (w?[(new Date()).getFullYear(),w,0]:$scope.DobToYWDarr(new Date()));
// 
		// $scope.searchWeek = week[1];
//                 
                // if(w){
                    // $scope.edtGetTimes({name:$scope.searchTerm}, $scope.searchWeek);
                    // $scope.clearplot();
                    // $scope.replot();
                // } else {
                    // $scope.clearplot();   
                // }
// 
		// $scope.days.forEach(function(el,index){
			// var jour = $scope.YWDarrToDob([week[0],week[1],index+1]);
			// var d = jour.getDate();
			// var m = (jour.getMonth()+1);
			// var y = jour.getFullYear();
			// el.date = (d<10?'0':'')+d+'/'+(m<10?'0':'')+m+'/'+y;
		// });
	// };
// 
	// /**
	 // * Realiza el pedido de los tipos de elementos a los que se les puede
	 // * consultar horarios, y los guarda en $scope.items
	 // */
	// $scope.edtAllTypes = function(){
// 		
		// edt.getAllTypes(function(err,data){
			// if(err){
				// console.log(err);
			// } else {
				// $scope.items.data = data;
			// }
		// });
	// };
// 	
	// /**
	 // * Reestablece las variables usadas en la consulta de horarios. Y se vuelven
	 // * a pedir los tipos de elementos, porque se comparte el array de consulta.
	 // * Probablemente sería bueno usar arrays distintos para no volver a realizar
	 // * la consulta.
	 // */
	// $scope.clearSearch = function(){
		// $scope.items = {
			// click: 'edtSubTypes',
			// data: []
		// };
// 		
		// $scope.setDates();
// 
		// $scope.searchTerm = 'Elija Tipo';
		// $scope.searchIcon = 'fa-question-circle';
		// $scope.type = '';
		// $scope.subtype = '';
		// $scope.newActCollapse = true;
// 
		// $scope.edtAllTypes();
	// };
// 	
	// /**
	 // * Posibles opciones para la repetición de actividades al momento de crearlas
	 // * @type {Array}
	 // */
	// $scope.actRepeats = [	{name:'Cada semana', value:'pw'},
							// {name:'Semana próxima', value:'nw'},
							// {name:'Cada dos semanas', value:'2w'},
							// {name:'Nunca', value:'n'}];
// 
	// /**
	 // * Días que se muestran en la tabla de horarios. Si se omite uno, no se
	 // * grafica. TODO: Verificar si la <div> del día existe antes de graficar!
	 // * (en timeplot())
	 // * @type {Array}
	 // */
	// $scope.days = [{name:'Lunes',
					// date:'',
					// collapsed: true
				// },
				// {	name:'Martes',
					// date:'',
					// collapsed: true
				// },
				// {	name:'Miércoles',
					// date:'',
					// collapsed: true
				// },
				// {	name:'Jueves',
					// date:'',
					// collapsed: true
				// },
				// {	name:'Viernes',
					// date:'',
					// collapsed: true
				// },
				// {	name:'Sábado',
					// date:'',
					// collapsed: true
				// }];
// 
	// /**
	 // * Variable deprecated, para testing antes de que los horarios se pidan a la base de datos.
	 // * @type {Array}
	 // */
	 // $scope.times = [];//	[{	day:'Jueves',
                                        // // times: [
                                        // // {	ti:'12h30',
                                                                // // tf:'13h48',
                                                                // // place:'Aula 6',
                                                                // // person:'Andrés Manelli',
                                                                // // type:'Curso'
                                        // // },
                                        // // {	ti:'08h10',
                                                // // tf:'10h20',
                                                // // place:'Anfiteatro Oeste',
                                                // // person:'Aníbal Mirasso',
                                                // // type:'Clase'
                                        // // },
                                        // // {	ti:'08h30',
                                                // // tf:'10h00',
                                                // // place:'Anfiteatro Oeste',
                                                // // person:'Aníbal Mirasso',
                                                // // type:'Clase'
                                        // // },
                                        // // {	ti:'15h00',
                                                // // tf:'16h30',
                                                // // place:'Asociación de Mecatrónica',
                                                // // person:'Fernando Cladera',
                                                // // type:'Curso'
                                        // // },
                                        // // {	ti:'19h00',
                                                // // tf:'20h00',
                                                // // place:'Anfiteatro Este',
                                                // // person:'Susana Bernasconi',
                                                // // type:'Plenaria'
                                        // // }]
                                // // },
                                // // {	day:'Lunes',
                                        // // times: [	
                                        // // {	ti:'14h30',
                                                // // tf:'16h48',
                                                // // place:'Aula 10',
                                                // // person:'Alvaro Alonso',
                                                // // type:'Clase'
                                        // // },
                                        // // {	ti:'17h00',
                                                // // tf:'18h00',
                                                // // place:'Aula 1',
                                                // // person:'Gino Copparoni',
                                                // // type:'TP'
                                        // // },
                                        // // {	ti:'08h40',
                                                // // tf:'09h50',
                                                // // place:'Aula 16',
                                                // // person:'Franco Ardiani',
                                                // // type:'Plenaria'
                                        // // },
                                        // // {	ti:'18h30',
                                                // // tf:'21h50',
                                                // // place:'Asociación de Mecatrónica',
                                                // // person:'Fernando Cladera',
                                                // // type:'Curso'
                                        // // },
                                        // // {	ti:'11h00',
                                                // // tf:'11h45',
                                                // // place:'Aula 5',
                                                // // person:'Maximiliano Badaloni',
                                                // // type:'Examen'
                                        // // }]
                                // // }];
// 	
	// /**
	 // * Devuelve una descripción de la franja horaria en HTML para incrustarla en
	 // * la <div> del día que corresponda
	 // * 
	 // * @param  {Object JSON} timejson
	 // * @return {HTML} info
	 // */	
	// $scope.blockHTML = function(timejson){
// 	
		// //w = Math.ceil(w);	
		// var info = ['<div style="padding-left: 3px; height: 100%">',
					// '<div style="height: 20%">'+timejson.actType.substr(0,15)+'</div>',
					// '<div style="height: 40%">'+timejson.ti+' - '+timejson.tf+'</div>',
					// '<div style="height: 20%">'+timejson.who.split(' ')[0].substr(0,1)+'. '+timejson.who.split(' ')[1]+'</div>',
					// '<div style="height: 20%">'+timejson.where+'</div>',
					// '</div>'].join('\n');
		// /*			
		// if(ttip){
			// return [	'<core-tooltip show="false"; position="'+pos+'">',
						// '<div style="height: '+h+'px; width: '+w+'px;"><core-icon icon="list"></core-icon></div>',
						// '<div tip style="height: '+htip+'px">'+info+'</div>',
						// '</core-tooltip>'].join('\n');
		// } else {
			// return info;
		// }*/
		// return info;
	// };
// 	
	// /**
	 // * Transforma un string de formato 'XXhXX' (donde X es un dígito [0-9]) a un
	 // * entero que representa los minutos desde las 00h00.
	 // * @param  {String} t
	 // * @return {Integer} mt
	 // */
	// $scope.getminutes = function(t){
		// var mt = t.split('h');
		// mt = parseInt(mt[0])*60 + parseInt(mt[1]);
		// return mt;
	// };
// 	
	// /**
	 // * Elimina del DOM las divisiones de horarios que se graficaron
	 // * anteriormente. Es necesario hacer esto antes de graficar con timeplot() 
	 // */
	// $scope.clearplot = function(){
// 
		// $scope.divs.forEach(function(el){
			// $('#edt * #'+el.id).remove();
		// });
// 		
		// $scope.divs=[];
		// $scope.divIndex=0;
	// };
// 	
	// /**
	 // * Shortcut para la función timeplot()
	 // */
	// $scope.replot = function(){
		// $scope.timeplot($scope.times, $scope.config);
	// };
// 	
	// /**
	 // * Crea las <div>s correspondientes a las franjas horarias, coloca la
	 // * información dentro, y las ubica en el día correspondiente.
	 // * 
	 // * @param  {Object} alltimes JSON con los datos de las franjas horarias El
	 // *                           formato está especificado en el README.md.
	 // * @param  {Object} config   JSON con los parámetros de colores y límites de
	 // *                           horarios. El formato está especificado en el README.md
	 // */
	// $scope.timeplot = function(alltimes, config){
// 
		// console.log(alltimes);
// 
		// var divwidth;
		// var divheight;
// 
		// if($('.edt-times-h').css('display') == 'none'){
			// $scope.suffix = 'V';
			// divwidth = $('.edt-days').width();
			// divheight = $('.chartContainerV').height();
		// } else {
			// $scope.suffix = 'H';
			// divwidth = $('.chartContainer').width();
			// divheight = $('.chartContainer').height();
		// }
// 
		// //	Transform times
		// var start = $scope.getminutes(config.limits.start);
		// var end = $scope.getminutes(config.limits.end);
		// var tt = end - start;
// 
		// alltimes.forEach(function(el){
			// var id = $scope.days[el.when.day-1].name+$scope.suffix;
                        // console.log(id);
			// //var times = el.times;
			// //	Transform times
			// //times.forEach(function(el){
				// el.mti = $scope.getminutes(el.ti);
				// el.mtf = $scope.getminutes(el.tf);
			// //});
// 			
			// //times.sort(function(a, b){
			// //	return a.mti - b.mti;
			// //});
// 			
			// var pos,htip;
// 		
			// if($scope.suffix == 'H'){	
				// pos = 'right center';
				// //htip = h - 10;
// 
				// if((el.mti-start) > (tt/2) ){
					// pos = 'left center';
					// //htip = h - 10;
				// }
// 
				// //times.forEach(function(el){
					// var x = ((el.mti-start)/tt)*divwidth;
					// var w = ((el.mtf - el.mti)/tt)*divwidth;
					// $scope.divs[$scope.divIndex] = document.createElement('div');
					// $scope.divs[$scope.divIndex].id = 'ttip-'+id+$scope.divIndex;
					// $scope.divs[$scope.divIndex].title = "";
					// $($scope.divs[$scope.divIndex]).css('position','absolute');
					// $($scope.divs[$scope.divIndex]).css('left', x);
					// $($scope.divs[$scope.divIndex]).css('width', w);
					// $($scope.divs[$scope.divIndex]).css('height',divheight);
					// $($scope.divs[$scope.divIndex]).css('background-color', config.types[el.actType].color);
					// if(w >= 85){
						// $($scope.divs[$scope.divIndex]).append($scope.blockHTML(el));
						// $scope.divs[$scope.divIndex].className += ' edt-block-info';
					// } else {
						// $scope.divs[$scope.divIndex].className += ' edt-ttip';
						// $($scope.divs[$scope.divIndex]).tooltip({
							// position: {
								// at: pos,
								// collision: 'none'
							// },
							// content: $scope.blockHTML(el)
						// });
					// }
					// document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
					// $scope.divIndex++;
					// //TODO: new row if superposition found
				// //});
			// } else {
				// pos = 'center bottom';
				// htip = 50;
// 
				// if((el.mti-start) > (tt/2) ){
					// pos = 'center top';
					// htip = 50;
				// }
// 
				// var top = 0;
				// var hcum = 0;
				// //times.forEach(function(el,index){
					// var y = ((el.mti-start)/tt)*divheight;
					// var h = ((el.mtf - el.mti)/tt)*divheight;
					// top = y-hcum;
					// $scope.divs[$scope.divIndex] = document.createElement('div');
					// $scope.divs[$scope.divIndex].id = 'ttip-'+id+$scope.divIndex;
					// $($scope.divs[$scope.divIndex]).css('position','relative');
					// if(index==0){$($scope.divs[$scope.divIndex]).css('top', top+'px');}
					// $($scope.divs[$scope.divIndex]).css('width', '100%');
					// $($scope.divs[$scope.divIndex]).css('height',h+'px');
					// $($scope.divs[$scope.divIndex]).css('background-color', config.types[el.actType].color);
					// if(h >= 70){
						// $($scope.divs[$scope.divIndex]).append($scope.blockHTML(el));
						// $scope.divs[$scope.divIndex].className += ' edt-block-info';
					// } else {
						// $scope.divs[$scope.divIndex].className += ' edt-ttip';
						// $($scope.divs[$scope.divIndex]).tooltip({
							// position: {
								// at: pos,
								// collision: 'none'
							// },
							// content: $scope.blockHTML(el)
						// });
					// }	
					// document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
					// $scope.divIndex++;
					// hcum+=h;
					// //TODO: new row if superposition found
				// //});
// 				
				// $('.edt-ttip').off( "mouseover" ).click(function(){
					// $(this).tooltip('open');
				// }).off("mouseout");
			// }
		// });
	// };
// 	
	// /**
	 // * Da el valor de verdad para el campo days[day].collapsed, que a su vez es
	 // * el que controla la apertura de la <div> vertical de horarios usado en
	 // * vistas mobile
	 // * 
	 // * @param  {Integer} day Índice del día (ubicación dentro del objeto
	 // *                       $scope.days) del día a desplegar.
	 // */
	// $scope.showTimesV = function(day) {
		// $scope.days[day].collapsed = !$scope.days[day].collapsed;
	// };
// 		
	// /**
	 // * Consulta en el servidor los diferentes elementos que corresponden a la
	 // * categoría seleccionada en item. Por ejemplo, si item=='Materia', un
	 // * elemento podría ser 'Análisis Matemático I'
	 // * 
	 // * @param  {String} item Categoría de elementos.
	 // *                       Por ejemplo: 'Materia', 'Profesor'
	 // */
	// $scope.edtSubTypes = function(item){
// 		
		// $scope.type = item.name;
		// $scope.searchTerm = 'Elija '+item.name;
		// $scope.searchIcon = item.icon;
		// edt.getSubTypes($scope.type, function(err,data){
			// if(err){
				// console.log(err);
			// } else {
				// $scope.items.data = data;
				// $scope.items.click = 'edtGetTimes';
			// }
		// });
	// };
// 	
	// /**
	 // * Teniendo la categoría y el elemento dentro de esa categoría, esta función
	 // * consulta al servidor las franjas horarias que correspondan a esos
	 // * parámetros más la semana actual seleccionada.
	 // * 
	 // * @param  {String} item Nombre del elemento a consultar.
	 // *                       Por ejemplo: 'Análisis Matemático I', 'Andrés Manelli'
	 // * @param  {Integer} week Semana seleccionada en el calendario.
	 // * 
	 // * TODO: Se tendría que consultar por ID, no por nombre!
	 // */
	// $scope.edtGetTimes = function(item, week){
		// $scope.searchTerm = item.name;
		// edt.getTimes(item.name,week,function(err,times){
			// if(err){
				// console.log(err);
			// } else {
				// console.log('EDT GET TIMES: ');
				// console.log(times);
                // $scope.times = times.data;
                // $scope.clearplot();
                // $scope.replot();
        // }
		// });
	// };
// 	
	// /**
	 // * Consulta al servidor la configuración del calendario, i.e colores y límites horarios.
	 // */
	// $scope.edtGetConfig = function(){
// 
		// edt.getConfig('',function(err,config){
			// if(err){
				// console.log(err);
			// } else {
				// $scope.config.limits = config.limits;
				// $scope.config.mongoTypes = config.types;
				// config.types.forEach(function(el){
					// ($scope.config.types[el.name] = new Object()).color = el.color;
				// });
				// //$scope.timeplot($scope.times, $scope.config);
			// }
		// });
	// };
// 
	// /**
	 // * Guarda en el objeto que representa la nueva actividad a guardar la fecha
	 // * de fin de la misma, en el caso de repetirse una o más veces.
	 // * 
	 // * @param  {String} strDate Fecha con formato: dd/mm/yyyy
	 // */
	// $scope.newActRepeatTo = function(strDate){
		// var date = strDate.split('/');
		// var day  = date[0];  
		// // month - 1 porque en formato ISO el mes es de 0 a 11
		// var month = date[1] - 1;  
		// var year = date[2]; 
// 
		// date = new Date(year,month,day);
		// date = $scope.DobToYWDarr(date);
// 
		// $scope.newAct.toWhen = {year:date[0],week:date[1],day:date[2]};
	// };
// 
	// /**
	 // * Ejecutada al seleccionar un elemento del menú desplegable de los posibles
	 // * casos de repetición. Se carga el valor actual en el objeto newAct y se
	 // * autocompletan los campos afectados, i.e la fecha de fin.
	 // * 
	 // * @param  {Object} repeat Objeto que guarda los strings que definen la
	 // * repetición.
	 // */
	// $scope.newActSelectRepeat = function(repeat){
		// $scope.newActRepeat = repeat;
		// $scope.newAct.repeat = repeat.value;
// 
		// /* 	Para llenar el valor del text del <input>. Podria usarse $('#newActWhen').val($scope.today);
		 // *	No se llama a 'onSelect'
		 // */
		// var ref = $scope.newAct.when;
		// var date = $scope.YWDarrToDob([ref.year,ref.week+1,ref.day]);
		// $('#newActToWhen').datepicker('setDate', date);
// 
		// /* 	Para que se carguen los valores en $scope.newAct.toWhen.* ; 
		 // *	
		 // */
		// var d = date.getDate();
		// var m = date.getMonth();
		// var y = date.getFullYear();
		// date = (d<10?'0':'')+d+'/'+((parseInt(m)+1)<10?'0':'')+(parseInt(m)+1)+'/'+y;
		// $scope.newActRepeatTo(date);
	// };
// 
	// /**
	 // * Carga en el objeto newAct el lugar dónde se realizará la actividad
	 // * 
	 // * @param  {Object} place Objeto que define el lugar
	 // *                        El formato puede encontrarse en el README.md
	 // */
	// $scope.newActSelectActWhere = function(place){
		// $scope.newAct.where = place.name;
                // $scope.newAct.whereID = place.id;
	// };
// 
	// /**
	 // * Carga en newAct la categoría de actividad a realizar. Por ejemplo 'Materia', 'Congreso'
	 // * 
	 // * @param  {Object} type Objeto que representa una categoría de actividad.
	 // *                        El formato puede encontrarse en el README.md
	 // */
	// $scope.newActSelectActType = function(type){
		// $scope.newAct.actType = type.name;
	// };
// 
	// /**
	 // * Carga en newAct la sub-categoría de la actividad a realizar. Por ejemplo
	 // * 'Análisis Matematico I', 'MECOM 20XX'
	 // * 
	 // * @param  {Object} subcat Objeto que representa una sub-categoría de actividad.
	 // *                         El formato puede encontrarse en el README.md
	 // */
	// $scope.newActSelectSubCats = function(subcat){
		// $scope.newAct.what = subcat.name;
                // $scope.newAct.whatID = subcat.id;
	// };
// 
	// /**
	 // * Consulta al servidor sobre los tipos de actividades posibles para la
	 // * categoría elegida (Por ejemplo 'Clase' para 'Materia' y 'Plenaria' para 'Congreso')
	 // * y sobre las sub-categorías (Por ejemplo 'Análisis Matemático I' para 'Materia')
	 // * 
	 // * @param  {Object} cat Objeto que representa una categoría de actividad.
	 // *                      El formato puede encontrarse en el README.md
	 // */
	// $scope.newActSubCats = function(cat){
// 
		// // Guardar la elección. Importante!
		// $scope.newAct.type = cat.name;
// 
		// edt.getConfig(cat.name, function(err,data){
			// if(err){
				// console.log(err);
			// } else {
				// $scope.actTypes = data.types;
				// $scope.newAct.actType = $scope.actTypes[0].name;
			// }
		// });
// 
		// edt.getSubTypes(cat.name,function(err,data){
// 
			// if(err){
				// console.log(err);
			// } else {
				// $scope.actSubCats = data;
				// $scope.newAct.what = $scope.actSubCats[0].name;
                                // $scope.newAct.whatID = $scope.actSubCats[0].id;
			// }
		// });
	// };
// 
	// /**
	 // * Verifica si lo ingresado en los <input> de horarios de la nueva actividad
	 // * son correctos y tienen sentido
	 // * 
	 // * @return {Bool} true si el  horario es válido, false en el caso contrario
	 // */
	// $scope.checkTimes = function(){
// 
		// var msg=null;
		// if($scope.getminutes($scope.newAct.ti) < $scope.getminutes($scope.config.limits.start)){
			// msg = 'La hora inicial no puede ser anterior al inicio general! ('
				// +$scope.config.limits.start+')';
		// } else if ($scope.getminutes($scope.newAct.tf) > $scope.getminutes($scope.config.limits.end)) {
			// msg = 'La hora final no puede ser posterior al fin general! ('
				// +$scope.config.limits.end+')';
		// } else if ($scope.getminutes($scope.newAct.ti) > $scope.getminutes($scope.newAct.tf)) {
			// msg = 'La hora inicial no puede ser posterior que la final!';
		// } else {
			// $('#WrongAct').prop('hidden',true);
			// return false;
		// }
// 		
		// if(msg){
			// $('#WrongAct').text(msg).prop('hidden',false);
			// return true;
		// } else {
			// $('#WrongAct').prop('hidden',true);
			// return false;
		// }
	// };
// 
	// /**
	 // * Guarda en newAct el valor de la fecha [de inicio] || [de desarrollo] de
	 // * la actividad. Autocompleta el campo de fin de actividad.
	 // * 
	 // * @param  {String} strDate Fecha en formato: dd/mm/yyyy
	 // */
	// $scope.newActWhen = function(strDate){
		// var date = strDate.split('/');
		// var day  = date[0];  
		// // month - 1 porque en formato ISO el mes es de 0 a 11
		// var month = date[1] - 1;  
		// var year = date[2]; 
// 
		// date = new Date(year,month,day);
		// $('#newActToWhen').datepicker( "option", "minDate", date);
		// date = $scope.DobToYWDarr(date);
		// $scope.newAct.when = {year:date[0],week:date[1],day:date[2]};
// 
		// //Auto completar toWhen
		// $scope.newActSelectRepeat($scope.newActRepeat);
	// };
// 
	// /**
	 // * Envía al servidor el JSON de la nueva actividad.
	 // * 
	 // * TODO: Enviar la actividad
	 // */
	// $scope.newActivity = function(){
// 
		// if($scope.checkTimes()){
			// return;
		// } else {
			// $scope.newAct.whoID = session.getId();
			// $scope.newAct.who = session.getUserName();
			// console.log($scope.newAct);
                        // edt.newActivity($scope.newAct,$scope.weeksInYear(),function(err){
                           // if(err){
                               // console.log(err);
                           // }
                        // });
		// }
	// };
// 
	// /**
	 // * Función recíproca de getminutes. Recibe un entero (cantidad de minutos) y
	 // * devuelve el string correspondiente.
	 // * 
	 // * @param  {Integer} minutes Cantidad de minutos.
	 // * @return {String}          Cadena que representa en horas y minutos la cantidad
	 // *                           de minutos minutes.
	 // *                           Formato: XXhXX
	 // */
	// $scope.minutes2Str = function(minutes){
		// var h = Math.floor(minutes/60);
		// var m = minutes-h*60;
// 
		// return (h<10?'0'+h:h)+'h'+(m<10?'0'+m:m);
	// };
// 
	// /**
	 // * Impide al usuario ingresar cadenas de caracteres erróneas y no conformes al formato de horarios.
	 // * Sólo permite ingresar números, y autocompleta la 'h'. Tampoco permite ingresar por ejemplo, 
	 // * la cifra '7' para las horas.
	 // * 
	 // * @param  {String} el Nombre del campo correspondiente al JSON de hora del objeto newAct.
	 // * @return {Bool}    true si la hora fue completada con éxito. false si falta algún dato.
	 // *
	 // * TODO: Permitir ingresar sólo el '7' para '07h00' por ejemplo. Lo mismo para los minutos
	 // */
	// $scope.correctTime = function(el){
// 	    
	    // var matches = /([0-2]{0,1})([0-9]{0,1})(h{0,1})([0-5]{0,1})([0-9]{0,1})/g.exec($scope.newAct[el]);
	    // if(matches[1] == ''){
	    	// $scope.newAct[el] = '';
	    // }else if(matches[2] == '' || parseInt(matches[1]+''+matches[2]) > 23){
	    	// $scope.newAct[el] = matches[1];
	    // }else if(matches[4] == '' ){
	    	// $scope.newAct[el] = matches[1]+''+matches[2]+'h';
	    // }else if(matches[5] == ''){
	    	// $scope.newAct[el] = matches[1]+''+matches[2]+'h'+''+matches[4];
	    // }else if(matches[5] != ''){
	    	// $scope.newAct[el] = matches[1]+''+matches[2]+'h'+''+matches[4]+''+matches[5];
	    	// return true;
	    	// //Desabilitar input?
	    // }
// 
	    // return false;
	// };
// 
	// /**
	 // * Al completar dos campos de tres de los horarios de la actividad, autocompleta el tercero
	 // * @param  {String} el Nombre del campo correspondiente al JSON de hora del objeto newAct.
	 // */
	// $scope.calcTime = function(el){
// 
		// if($scope.correctTime(el)){
// 
			// if($('#newActStart').parsley().isValid() && $('#newActDur').parsley().isValid(true)){
				// var start = $scope.getminutes($scope.newAct.ti);
				// var dur = $scope.getminutes($scope.newAct.dur);
				// var end = start+dur;
				// end = $scope.minutes2Str(end);
				// $scope.newAct.tf = end;
// 
				// if($scope.checkTimes()){$scope.newAct.tf = '';}
			// } else if($('#newActStart').parsley().isValid() && $('#newActEnd').parsley().isValid()){
				// var start = $scope.getminutes($('#newActStart').val());
				// var end = $scope.getminutes($('#newActEnd').val());
				// var dur = end-start;
				// dur = $scope.minutes2Str(dur);
				// $scope.newAct.dur = dur;
// 
				// if($scope.checkTimes()){$scope.newAct.dur = '';}
			// } else if($('#newActDur').parsley().isValid(true) && $('#newActEnd').parsley().isValid()){
				// var dur = $scope.getminutes($('#newActDur').val());
				// var end = $scope.getminutes($('#newActEnd').val());
				// var start = end-dur;
				// start = $scope.minutes2Str(start);
				// $scope.newAct.ti = start;
// 
				// if($scope.checkTimes()){$scope.newAct.ti = '';}
			// }
		// }
	// };
// 
	// /**
	 // * Borra el texto de todos los <inputs> del form.
	 // */
	// $scope.clearAct = function(){
// 
		// $('#newActForm * input').val('');
	// };
// 
	// /**
	 // * Realiza el pedido de valores por única vez al cargar el controlador,
	 // * luego de que se haya generado el DOM. Importante!!
	 // *
	 // * TODO: Tal vez estas cosas sea mejor hacerlas al cargar la página inicial,
	 // * en ParentCtrl.js porque sino, cada vez que tocamos 'EDT' vuelve a cargar esto!
	 // */
	// $scope.$on('$viewContentLoaded', function () {
		// $scope.clearSearch();
//                 
		// /* Como los ids de la tabla del EDT se generan dinámicamente en un ng-repeat,
		 // * el documento tarda un tiempo en verlos. Deberia haber un evento como $viewContentLoaded
		 // * que indique cuándo están accesibles. O se debería cambiar la forma en que está hecho el EDT.
		 // * Por el momento hacer un delay funciona...
		 // */
		// $timeout(function(){
// 
			// // Si no está definido no se pueden crear los campos al vuelo
			// $scope.newAct = {};
			// $scope.actCats = {};
			// // Si no está definido al datepicker no le gusta
			// $scope.newAct.when = {};
			// $scope.newAct.toWhen = {};
// 
			// /* 	TODO:
			 // *	mongoTypes usado para el menú desplegable en edt.html,
			 // *	types usado para el plot, que busca según types[el.name]
			 // * 	Se debería solucionar esta diferencia
			 // */
			// $scope.config = { limits: {}, types: {}, mongoTypes: {}};
			// $scope.edtGetConfig();
// 
			// edt.getTypes('Activity',function(err,data){
				// if(err){
					// console.log('Error Getting Activities Types');
				// } else {
					// $scope.actCats = data;
					// $scope.newAct.type = $scope.actCats[0].name;
					// $scope.newActSubCats($scope.newAct.type);
				// }
			// });
// 
			// edt.getPlaces(function(err,data){
				// if(err){
					// console.log(err);
				// } else {
					// $scope.actPlaces = data;
					// $scope.newAct.where = $scope.actPlaces[0].name;
                                        // $scope.newAct.whereID = $scope.actPlaces[0].id;
				// }
			// });
// 
			// /*	Cargar las semanas en el año, sólo una vez al cargar el controlador
			 // */
			// var wn = $scope.weeksInYear();
			// var i;
			// $scope.weeks = [];
			// for(i=1;i<=wn;i++){
				// $scope.weeks.push(i);
			// };
// 
// 
			// /**
			 // * today guarda la fecha de hoy para usos posteriores y referencia
			 // * @type {String}
			 // */
			// var ajd = new Date();
			// var d = ajd.getDate();
			// var m = ajd.getMonth();
			// var y = ajd.getFullYear();
			// $scope.today = (d<10?'0':'')+d+'/'+((parseInt(m)+1)<10?'0':'')+(parseInt(m)+1)+'/'+y;
			// /**
			 // * thisWeek guarda la referencia de la semana actual para usos posteriores
			 // * @type {Integer}
			 // */
			// $scope.thisWeek = $scope.DobToYWDarr($scope.today)[1];
// 
			// /**
			 // * newActRepeat inicializado en 'Nunca' para ocultar el <input> de fecha de cierre.
			 // * 
			 // * @type {String}
			 // *
			 // * TODO: Cuidado si se agregan campos a actRepeats. El índice debe coincidir con 'Nunca'!
			 // */
			// $scope.newActRepeat = $scope.actRepeats[3];
			// $scope.newAct.repeat = $scope.newActRepeat.value;
// 
			// /**
			 // * Mostramos el calendario
			 // */
			// $('#edt').prop('hidden',false);
// 
			// /**
			 // * Configuración del calendario de fecha de inicio.
			 // * Por más que diga dd/mm/yy el formato mostrado es dd/mm/yyyy
			 // */
			// $('#newActWhen').datepicker({	minDate: 0,
											// showWeek: true,
											// dateFormat:'dd/mm/yy',
											// defaultDate: 0,
											// firstDay: 1,
											// onSelect: $scope.newActWhen
											// });
			// /* 	Para llenar el valor del input. Podria usarse $('#newActWhen').val($scope.today);
			 // *	No se llama a 'onSelect'
			 // */
			// $('#newActWhen').datepicker('setDate', new Date());
// 
			// /**
			 // * Configuración del calendario de fecha de cierre.
			 // * Por más que diga dd/mm/yy el formato mostrado es dd/mm/yyyy
			 // */
			// $('#newActToWhen').datepicker({	showWeek: true,
                                            // dateFormat:'dd/mm/yy',
                                            // firstDay: 1,
                                            // beforeShowDay : function (date) {
                                                    // var rep = $scope.newActRepeat.value;
                                                    // var ref = $scope.newAct.when;
                                                    // date = $scope.DobToYWDarr(date);
                                                    // // Nunca repetir o el DoW no es el mismo
                                                    // if(rep === 'n' || date[2] != ref.day){
                                                            // return [false];
                                                    // } else if(rep === 'pw'){
                                                            // // week check
                                                    // return [true];
                                            // } else if(rep === 'nw'){
                                                    // // Solo la semana siguiente
                                                    // return [((date[1]-ref.week) == 1) && (parseInt(date[2]) == ref.day)];
                                            // } else if(rep === '2w'){
                                                    // // Cada dos semanas
                                                    // return [(date[1]-ref.week)%2 == 0];
                                            // }
                                    // },
                                    // onSelect: $scope.newActRepeatTo
                                    // //minDate seteada en $scope.newActWhen()
			// });
// 
			// /* 	Para que se carguen los valores en $scope.newAct.when.* ; 
			 // *	Hay que llamarlo después de crear el $('#newActToWhen').datepicker();
			 // */
			// $scope.newActWhen($scope.today);
// 
			// /**
			 // * No sé porqué pero es muy necesario hacer esto
			 // *
			 // * TODO: Realmente lo es?
			 // */
			// $('.ui-datepicker').css('margin-top', '0px');
// 
		// }, 200);
	// });
	
});
