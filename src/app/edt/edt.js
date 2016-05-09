/*global
    angular
*/

(function(){

    'use strict';

    angular.module('RedSocialAsociacion')
      .config(['navBarProvider',function(navBarProvider){
        navBarProvider.addTab('edt',function(session,$location){
          var translation = session.getTranslation();
          if(translation !== null){
            return {name:translation.navBar.edt, href:'#/edt/'+session.getID(), active:$location.path().match(/^\/edt.*/g), visible:true};
          }else{
            return {};
          }
        });
      }])
      .controller('EdtCtrl', function ($scope, $stateParams, edt, session, $timeout, $http) {

        $scope.partSearchResults = [];
        //Required. If not present produce errors.
        $scope.dummyWhenFrom = [];
        $scope.dummyWhenTo = [];
        $scope.whatIdToSearch = 0;
        $scope.whoIdToSearch = 0;
        
        if($stateParams.id){
            $scope.whatIdToSearch = $stateParams.id;
            $scope.whoIdToSearch = $stateParams.id;
        }else{
            $scope.whatIdToSearch = 0;
            $scope.whoIdToSearch = 0;
        }

        $scope.newAct = {
            periods: [],
            whatId: -1,
            timezone: new Date().getTimezoneOffset()
        };

        $scope.actAsocs = [];

        $scope.actTypes = [];

        $scope.newActDays = [];

        $scope.daySelected = function (periodIndex) {
            var selected = false;
            $scope.newActDays[periodIndex].forEach(function (day) {
                if (day){
                    selected = true;
                }
            });

            return selected;
        };

        //necesita llamada a getAssociations
        $scope.selectAsoc = function (asoc) {
          console.log(asoc);
            $scope.newAct.whatId = asoc.instID;
            $scope.newAct.whatName = asoc.name;
            
            console.log($scope.newAct.whatId);
            console.log($scope.newAct.whoId);

            edt.getActivityTypes(asoc.label, function(err, activityTypes){
              if(err){
                console.log('Error getting activity types: ',err);
              }else{
                $scope.actTypes = activityTypes;
                if($scope.actTypes.length > 0){
                  $scope.newAct.periods.forEach(function (period) {
                    period.type = $scope.actTypes[0].label;
                  });
                }
              }
            });
        };

        $scope.selectActType = function (typeLabel, periodIndex) {
            $scope.newAct.periods[periodIndex].type = typeLabel;
        };

        //NECESITA llamada a selectAsoc
        $scope.addRemovePeriod = function (periodIndex) {
            //Add
            if (periodIndex === -1) {
                $scope.newAct.periods.push({});
                periodIndex = $scope.newAct.periods.length - 1;
                $scope.newAct.periods[periodIndex].from = null;
                $scope.newAct.periods[periodIndex].to = null;
                $scope.newAct.periods[periodIndex].desc = '';
                $scope.newAct.periods[periodIndex].days = [{day: 'lu', times: [{}]},
                    {day: 'ma', times: [{}]}, {day: 'mi', times: [{}]}, {day: 'ju', times: [{}]},
                    {day: 'vi', times: [{}]}, {day: 'sa', times: [{}]}, {day: 'do', times: [{}]}];
                $scope.newActDays.push([false, false, false, false, false, false, false]);
                $scope.newAct.periods[periodIndex].type = ($scope.actTypes.length > 0) ? $scope.actTypes[0].label : 'NOT_SPECIFIED';
            }
            //Remove
            else {
                $scope.newAct.periods.splice(periodIndex, 1);
                $scope.newActDays.splice(periodIndex, 1);
            }

            console.log($scope.newActDays);
        };

        $scope.addRemoveTime = function (periodIndex, dayIndex, timeIndex) {
            console.log($scope.newAct.periods);
            console.log(periodIndex, dayIndex, timeIndex);
            //Add
            if (timeIndex === -1) {
                $scope.newAct.periods[periodIndex].days[dayIndex].times.push({});
            }
            //Remove
            else {
                $scope.newAct.periods[periodIndex].days[dayIndex].times.splice(timeIndex, 1);
            }
        };

        $scope.setMinTimeTo = function(periodIndex, dayIndex, timeIndex){
            var currentTo = $('#newActTimeTo'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').get().split('h').map(function(str){return parseInt(str);});
            var limit = $('#newActTimeFrom'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').get().split('h').map(function(str){return parseInt(str);});
            var interval = $('#newActTimeFrom'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').get('interval');
            var newValue = limit;
            newValue[0]=(limit[1]===60-interval)?limit[0]+1:limit[0];
            newValue[1]=(limit[1]===60-interval)?0:limit[1]+interval;
            if(!isNaN(currentTo[0])){
                if((currentTo[0] < limit[0]) || ((currentTo[0] === limit[0]) && (currentTo[1] <= limit[1]))){
                    $('#newActTimeTo'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').set('select',newValue);
                }
            }
            $('#newActTimeTo'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').set('min',newValue);
        };

        $scope.setMaxTimeFrom = function(periodIndex, dayIndex, timeIndex){
            var currentFrom = $('#newActTimeFrom'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').get().split('h').map(function(str){return parseInt(str);});
            var limit = $('#newActTimeTo'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').get().split('h').map(function(str){return parseInt(str);});
            var interval = $('#newActTimeTo'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').get('interval');
            var newValue = limit;
            newValue[0]=(limit[1]===0)?limit[0]-1:limit[0];
            newValue[1]=(limit[1]===0)?60-interval:limit[1]-interval;
            if(!isNaN(currentFrom[0])){
                if((currentFrom[0] > limit[0]) || ((currentFrom[0] === limit[0]) && (currentFrom[1] >= limit[1]))){
                    $('#newActTimeFrom'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').set('select',newValue);
                }
            }
            $('#newActTimeFrom'+periodIndex+'-'+dayIndex+'-'+timeIndex).pickatime('picker').set('max',newValue);
        };

        //Necesita translations..
        $scope.getAssociations = function () {
          edt.getAssociations(function(err,asocs){
            if(err){
              return;
            } else {
              asocs[asocs.length - 1].name = session.getTranslation().labels[asocs[asocs.length - 1].name];
              $scope.actAsocs = asocs;
              $scope.selectAsoc(asocs[0]);
              return;
            }
          });
        };

        $scope.partSearch = function () {
            
            if($('#partSearchDDToggle').hasClass("open")){

            }else{
                $('#partSearchDDToggle').addClass('open');
            }
            
            if ($scope.partSearchTerm === '') {
                $('#partSearchDDToggle').removeClass('open');
                $scope.partSearchResults = [];
                return;
            }
            var path = '/search?what=Parts&term=' + $scope.partSearchTerm;
            $http({method: 'GET', url: path})
            .success(function (results) {
                console.log(results);
                $scope.partSearchResults = results;
            });
        };

        /**
         * Para que las franjas horarias se adapten automáticamente.
         */
        $(window).on('resize', function () {
            if ($scope.newActCollapse) {
                $scope.clearplot();
                $scope.replot();
            }
        });

        /** @type {Boolean} Decide si se muestra el EDT o el form de nueva actividad */
        $scope.newActCollapse = true;
        $scope.toggleNewActForm = function(){
          $scope.newActCollapse = !$scope.newActCollapse;
          if($scope.newAct.periods.length === 0){
            $scope.addRemovePeriod(-1);
          }
        };
        /** @type {Array} Guarda las <div>s que muestran las frajas horarias para poder eliminarlas */
        $scope.divs = [];
        /** @type {Integer} Usado para referenciar un <div> en timeplot() */
        $scope.divIndex = 0;
        /** @type {String} Sufijo usado para elegir entre las <div>s contenedoras
         *  horizontales o verticales
         */
        $scope.suffix = 'H';
        /**
         * Referencia para usarlo en edt.html para mostrar u ocultar el botón de nueva actividad
         * @type {Service}
         *
         * TODO: Tal vez sea mejor manejarlo via una variable del $scope
         * y no con el servicio directamente?
         */
        $scope.session = session;

        /**
         * Convierte un objeto de tipo Date en un array [Year,Week,DayOfWeek], normalizado según ISO 8601
         * @param {Date Object} DArg
         * @return {Array} [YN, WN, D]
         */
        $scope.DobToYWDarr = function (DArg) {
            var DOb = new Date(DArg); // <- errors with Opera 9
            if (isNaN(DOb)){
                return false;
            }
            var D = DOb.getDay();
            if (D === 0){
                D = 7; // D = ISO DoW
            }
            DOb.setDate(DOb.getDate() + (4 - D));   // To nearest Thu, mid-week
            var YN = DOb.getFullYear();           // YN = ISO W-N Year
            // uses Jan 1 of YN; -6h allows for Summer Time
            var ZBDoCY = Math.floor((DOb.getTime() - new Date(YN, 0, 1, -6)) / 864e5);
            var WN = 1 + Math.floor(ZBDoCY / 7);

            return [YN, WN, D]; /* ISO 8601 */
        };

        /**
         * Convierte un array de tipo [Year, Week, DayOfWeek] (ISO 8601) en un objeto de tipo Date
         * @param {Array} AYWD ([Year, Week, DayOfWeek])
         * @return {Date Object} Dob
         */
        $scope.YWDarrToDob = function (AYWD) { // Arg : ISO 8601 : [Y, W, D]
            var DOb = new Date(+AYWD[0], 0, 3);  // Jan 3
            if (isNaN(DOb)){
                return false;
            }
            DOb.setDate(3 - DOb.getDay() + (AYWD[1] - 1) * 7 + AYWD[2]);
            return DOb;
        };

        /**
         * Devuelve el número de semanas en el presente año
         * @return {Integer} week
         */
        $scope.weeksInYear = function (year) {
          var d;
          if(year){
            d = new Date(year,11,31);
          }else{
            d = new Date((new Date()).getFullYear(), 11, 31);
          }
          var week = $scope.DobToYWDarr(d)[1];
          return week == 1 ? $scope.DobToYWDarr(d.setDate(24))[1] : week;
        };

        $scope.selectFav = function(fav){
            $scope.whoIdToSearch = 0;
            $scope.whatIdToSearch = fav.idNEO;
            
            $scope.edtGetTimes();
        };

        /**
         * Para una semana dada como parámetro, o para la semana actual si es
         * omitido,	guarda los strings correspondientes a las fechas de esa semana.
         * @param {Integer} w
         */
        $scope.setDates = function (w) {

            // No importa el Day Of Week en week, porque al iterar se sobreescribe
          if(w === 0){
            $scope.searchYear -= 1;
            w = $scope.weeksInYear($scope.searchYear);
            $scope.weeks = Array.apply(null, new Array(w)).map(function (_, i) {return i+1;});
          }else if(w > $scope.weeksInYear($scope.searchYear)){
            $scope.searchYear += 1;
            w = 1;
          }else if(!w){
            return;
          }

          $scope.searchWeek = w;

          $scope.edtGetTimes();
          $scope.clearplot();
          $scope.replot();

          $scope.daysToShow.forEach(function (el, index) {
            var jour = $scope.YWDarrToDob([$scope.searchYear, $scope.searchWeek, index + 1]);
            var d = jour.getDate();
            var m = (jour.getMonth() + 1);
            var y = jour.getFullYear();
            el.date = (d < 10 ? '0' : '') + d + '/' + (m < 10 ? '0' : '') + m + '/' + y;
          });
        };

        /**
         * Reestablece las variables usadas en la consulta de horarios. Y se vuelven
         * a pedir los tipos de elementos, porque se comparte el array de consulta.
         * Probablemente sería bueno usar arrays distintos para no volver a realizar
         * la consulta.
         */
        $scope.clearSearch = function () {

          $scope.searchYear = $scope.thisYear;

            $scope.setDates($scope.thisWeek);
            $scope.newActCollapse = true;

            $scope.whoIdToSearch = session.getID();
            $scope.whatIdToSearch = 0;

            $scope.edtGetTimes();

        };

        /**
         * Días que se muestran en la tabla de horarios. Si se omite uno, no se
         * grafica. TODO: Verificar si la <div> del día existe antes de graficar!
         * (en timeplot())
         * @type {Array}
         */
        $scope.daysToShow = [{name: 'lu',
                date: '',
                collapsed: true
            },
            {name: 'ma',
                date: '',
                collapsed: true
            },
            {name: 'mi',
                date: '',
                collapsed: true
            },
            {name: 'ju',
                date: '',
                collapsed: true
            },
            {name: 'vi',
                date: '',
                collapsed: true
            },
            {name: 'sa',
                date: '',
                collapsed: true
            },
            {name: 'do',
              date: '',
              collapsed: true
            }];

        /**
         * Guarda el array de activides que devuelve el server para ser ploteados.
         * @type {Array}
         */
        $scope.times = [];

        /**
         * Devuelve una descripción de la franja horaria en HTML para incrustarla en
         * la <div> del día que corresponda
         * 
         * @param  {Object JSON} timejson
         * @return {HTML} info
         */
        $scope.blockHTML = function (timejson) {

            var info = ['<div style="padding-left: 3px; height: 100%">',
                '<div style="height: 20%">' + session.getTranslation().labels[timejson.type].substr(0, 15) + '</div>',
                '<div style="height: 20%">' + timejson.from + ' - ' + timejson.to + '</div>',
                //TODO!!
                //'<div style="height: 20%">' + timejson.where + '</div>',
                '<div style="height: 20%">' + timejson.whoName + '</div>',
                '<div style="height: 20%">' + timejson.desc + '</div>',
                '</div>'].join('\n');
            return info;
        };

        /**
         * Transforma un string de formato 'XXhXX' (donde X es un dígito [0-9]) a un
         * entero que representa los minutos desde las 00h00.
         * @param  {String} t
         * @return {Integer} mt
         */
        $scope.getminutes = function (t) {
            var mt = t.split('h');
            mt = parseInt(mt[0]) * 60 + parseInt(mt[1]);
            return mt;
        };

        /**
         * Elimina del DOM las divisiones de horarios que se graficaron
         * anteriormente. Es necesario hacer esto antes de graficar con timeplot() 
         */
        $scope.clearplot = function () {

            $scope.divs.forEach(function (el) {
                $('#edt * #' + el.id).remove();
            });

            $scope.divs = [];
            $scope.divIndex = 0;
        };

        /**
         * Shortcut para la función timeplot()
         */
        $scope.replot = function () {
          $scope.timeplot($scope.times, $scope.config);
        };

        /**
         * Crea las <div>s correspondientes a las franjas horarias, coloca la
         * información dentro, y las ubica en el día correspondiente.
         * 
         * @param  {Object} alltimes JSON con los datos de las franjas horarias El
         *                           formato está especificado en el README.md.
         * @param  {Object} config   JSON con los parámetros de colores y límites de
         *                           horarios. El formato está especificado en el README.md
         */
        $scope.timeplot = function (alltimes, config) {

            if(alltimes.length === 0 || !$scope.config || !session.getTranslation()){
                return;
            }

            var divwidth;
            var divheight;

            if ($('.edt-times-h').css('display') == 'none') {
                $scope.suffix = 'V';
                divwidth = $('.edt-days').width();
                divheight = $('.chartContainerV').height();
            } else {
                $scope.suffix = 'H';
                divwidth = $('.chartContainer').width();
                divheight = $('.chartContainer').height();
            }

            //	Transform times
            var start = $scope.getminutes(config.limits.start);
            var end = $scope.getminutes(config.limits.end);
            var tt = end - start;
            //Para poder poner 'top' por día
            var localIndex = 0;
            var divsPerDay = [0,0,0,0,0,0];
            alltimes.forEach(function (el) {
                var id = $scope.daysToShow[el.day - 1].name + $scope.suffix;
                divsPerDay[el.day-1]++;
                if(divsPerDay[el.day-1] === 1){
                    localIndex = 0;
                }
                else{
                    localIndex++;
                }
                
                el.mti = $scope.getminutes(el.from);
                el.mtf = $scope.getminutes(el.to);

                if ($scope.suffix == 'H') {

                    var x = ((el.mti - start) / tt) * divwidth;
                    var w = ((el.mtf - el.mti) / tt) * divwidth;
                    $scope.divs[$scope.divIndex] = document.createElement('div');
                    $scope.divs[$scope.divIndex].id = 'act-' + id + $scope.divIndex;
                    $scope.divs[$scope.divIndex].title = "";
                    $($scope.divs[$scope.divIndex]).css('position', 'absolute');
                    $($scope.divs[$scope.divIndex]).css('left', x);
                    $($scope.divs[$scope.divIndex]).css('width', w);
                    $($scope.divs[$scope.divIndex]).css('height', divheight);
                    $($scope.divs[$scope.divIndex]).css('background-color', config.colors[el.type]);
                    if (w >= 85) {
                        $($scope.divs[$scope.divIndex]).append($scope.blockHTML(el));
                        $scope.divs[$scope.divIndex].className += ' edt-block-info';
                    }
                    document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
                    $scope.divIndex++;
                    //TODO: new row if superposition found
                } else {

                    var top = 0;
                    var hcum = 0;
                    var y = ((el.mti - start) / tt) * divheight;
                    var h = ((el.mtf - el.mti) / tt) * divheight;
                    top = y - hcum;
                    $scope.divs[$scope.divIndex] = document.createElement('div');
                    $scope.divs[$scope.divIndex].id = 'act-' + id + $scope.divIndex;
                    $($scope.divs[$scope.divIndex]).css('position', 'relative');
                    if (localIndex === 0) {
                        $($scope.divs[$scope.divIndex]).css('top', top + 'px');
                    }
                    $($scope.divs[$scope.divIndex]).css('width', '100%');
                    $($scope.divs[$scope.divIndex]).css('height', h + 'px');
                    $($scope.divs[$scope.divIndex]).css('background-color', config.colors[el.type]);
                    if (h >= 70) {
                        $($scope.divs[$scope.divIndex]).append($scope.blockHTML(el));
                        $scope.divs[$scope.divIndex].className += ' edt-block-info';
                    }
                    document.getElementById(id).appendChild($scope.divs[$scope.divIndex]);
                    $scope.divIndex++;
                    hcum += h;
                    //TODO: new row if superposition found
                }
            });
        };

        /**
         * Da el valor de verdad para el campo days[day].collapsed, que a su vez es
         * el que controla la apertura de la <div> vertical de horarios usado en
         * vistas mobile
         * 
         * @param  {Integer} day Índice del día (ubicación dentro del objeto
         *                       $scope.daysToShow) del día a desplegar.
         */
        $scope.showTimesV = function (day) {
            $scope.daysToShow[day].collapsed = !$scope.daysToShow[day].collapsed;
        };

        /**
         * Teniendo la categoría y el elemento dentro de esa categoría, esta función
         * consulta al servidor las franjas horarias que correspondan a esos
         * parámetros más la semana actual seleccionada.
         * 
         * @param  {String} item Nombre del elemento a consultar.
         *                       Por ejemplo: 'Análisis Matemático I', 'Andrés Manelli'
         * @param  {Integer} week Semana seleccionada en el calendario.
         * 
         * TODO: Se tendría que consultar por ID, no por nombre!
         */
        $scope.edtGetTimes = function () {

            edt.getTimes(   $scope.whatIdToSearch, 
                            $scope.whoIdToSearch, 
                            $scope.searchWeek, 
                            $scope.thisYear, 
                            function (err, times) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('EDT GET TIMES: ');
                    console.log(times);
                    $scope.times = times;
                    $scope.clearplot();
                    $scope.replot();
                }
            });
        };

        /**
         * Consulta al servidor la configuración del calendario, i.e colores y límites horarios.
         */
        $scope.$on('edt:gotConfig',function(e,config){
          $scope.config = config;
          $scope.replot();
        });

        /**
         * Guarda en el objeto que representa la nueva actividad a guardar la fecha
         * de fin de la misma, en el caso de repetirse una o más veces.
         * 
         * @param  {String} strDate Fecha con formato: dd/mm/yyyy
         */
        $scope.newActWhenTo = function (strDate, periodIndex) {
            var date = strDate.split('/');
            var day = date[0];
            // month - 1 porque en formato ISO el mes es de 0 a 11
            var month = date[1] - 1;
            var year = date[2];

            date = new Date(year, month, day);
            date = $scope.DobToYWDarr(date);

            $scope.newAct.periods[periodIndex].to = {year: date[0], week: date[1], day: date[2]};
        };

        /**
         * Carga en el objeto newAct el lugar dónde se realizará la actividad
         * 
         * @param  {Object} place Objeto que define el lugar
         *                        El formato puede encontrarse en el README.md
         *
         $scope.newActSelectActWhere = function(place){
         $scope.newAct.where = place.name;
         $scope.newAct.whereID = place.id;
         };*/

        /**
         * Verifica si lo ingresado en los <input> de horarios de la nueva actividad
         * son correctos y tienen sentido
         * 
         * @return {Bool} true si el  horario es válido, false en el caso contrario
         */
        $scope.checkTimes = function (periodIndex, dayIndex) {

            //TODO: HACERLO FOR EACH PERIOD Y TIME!
            console.log($scope.config.limits);
            var msg = null;
            $scope.newAct.periods[periodIndex].days[dayIndex].times.forEach(function (time, timeIndex) {
                console.log(time);
                if ($scope.getminutes(time.from) < $scope.getminutes($scope.config.limits.start)) {
                    msg = 'La hora inicial no puede ser anterior al inicio general! (' +
                        $scope.config.limits.start + ') en Periodo ' + (periodIndex + 1) + ', ' +
                        session.getTranslation().edt[$scope.daysToShow[dayIndex].name] +
                        ', Horario ' + (timeIndex + 1);
                } else if ($scope.getminutes(time.to) > $scope.getminutes($scope.config.limits.end)) {
                    msg = 'La hora final no puede ser posterior al fin general! (' +
                        $scope.config.limits.end + ') en Periodo ' + (periodIndex + 1) + ', ' +
                        session.getTranslation().edt[$scope.daysToShow[dayIndex].name] +
                        ', Horario ' + (timeIndex + 1);
                } else if ($scope.getminutes(time.from) > $scope.getminutes(time.to)) {
                    msg = 'La hora inicial no puede ser posterior que la final! en Periodo ' + (periodIndex + 1) + ', ' +
                        session.getTranslation().edt[$scope.daysToShow[dayIndex].name] +
                        ', Horario ' + (timeIndex + 1);
                } else if ($scope.getminutes(time.from) === $scope.getminutes(time.to)) {
                    msg = 'La hora inicial y final no pueden ser iguales! en Periodo ' + (periodIndex + 1) + ', ' +
                        session.getTranslation().edt[$scope.daysToShow[dayIndex].name] +
                        ', Horario ' + (timeIndex + 1);
                } else {
                    $('#WrongAct').prop('hidden', true);
                }
            });

            if (msg) {
                $('#WrongAct').text(msg).prop('hidden', false);
                return true;
            } else {
                $('#WrongAct').prop('hidden', true);
                return false;
            }
        };

        /**
         * Guarda en newAct el valor de la fecha [de inicio] || [de desarrollo] de
         * la actividad. Autocompleta el campo de fin de actividad.
         * 
         * @param  {String} strDate Fecha en formato: dd/mm/yyyy
         */
        $scope.newActWhenFrom = function (strDate, periodIndex) {
            console.log(strDate, periodIndex);
            var date = strDate.split('/');
            var day = date[0] - 0;
            // month - 1 porque en formato ISO el mes es de 0 a 11
            var month = date[1] - 1;
            var year = date[2] - 0;

            date = new Date(year, month, day);
            $('#newActTo' + periodIndex).pickadate('picker').set('min', date).set('highlight',date).render();
            date = $scope.DobToYWDarr(date);

            $scope.newAct.periods[periodIndex].from = {year: date[0], week: date[1], day: date[2]};
            if($scope.newAct.periods[periodIndex].to === null){
              $scope.dummyWhenTo[periodIndex] = strDate;
              $scope.newAct.periods[periodIndex].to = {year: date[0], week: date[1], day: date[2]};
            }

        };

        /**
         * Envía al servidor el JSON de la nueva actividad.
         * 
         */
        $scope.newActivity = function () {

            var actsToCreate = [];
            var error = false;
            var minweek = $scope.weeksInYear();
            if ($scope.newAct.periods.length === 0){
                return;
            }

            $scope.newAct.periods.forEach(function (period, periodIndex) {
                var wstep = 1;
                var wto = period.to.week;
                var wfrom = period.from.week;
                if(wfrom < minweek){
                  minweek = wfrom;
                }
                if (wto < wfrom) {
                    //Pasamos de año
                    //Sumamos las que nos pasamos
                    wto = $scope.weeksInYear() + wto;
                }
                var fromYear = period.from.year;
                var toYear = period.to.year;
                var yearToInsert = fromYear;
                var weekToInsert = -1;
                
                var pushDayTimes = function (day, dayIndex) {
                    if (error){
                        return;
                    }
                    if (w == wfrom && (dayIndex + 1 < period.from.day)){
                        return;
                    }
                    if ($scope.newActDays[periodIndex][dayIndex]) {
                        error = $scope.checkTimes(periodIndex, dayIndex);
                        day.times.forEach(function (time) {
                            actsToCreate.push({
                                day: dayIndex + 1,
                                week: weekToInsert,
                                year: yearToInsert,
                                type: period.type,
                                desc: period.desc,
                                whatId: $scope.newAct.whatId,
                                whoId: $scope.newAct.whoId,
                                whatName: $scope.newAct.whatName,
                                whoName: $scope.newAct.whoName,
                                from: time.from,
                                to: time.to,
                                timezone: $scope.newAct.timezone
                            });
                        });
                    }
                };

                for (var w = wfrom; w <= wto; w += wstep) {
                    weekToInsert = w;
                    if (w > $scope.weeksInYear()) {
                        weekToInsert = w - $scope.weeksInYear();
                        yearToInsert = toYear;
                    }
                    period.days.forEach(pushDayTimes);
                    if (error){
                        break;
                    }
                }
            });

            if (!error) {
                console.log(actsToCreate);
                edt.newActivity(actsToCreate, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                      $scope.newActCollapse = true;
                      $scope.setDates(minweek);
                        $scope.clearAct();
                    }
                });
            } else{
                return;
            }
        };

        /**
         * Función recíproca de getminutes. Recibe un entero (cantidad de minutos) y
         * devuelve el string correspondiente.
         * 
         * @param  {Integer} minutes Cantidad de minutos.
         * @return {String}          Cadena que representa en horas y minutos la cantidad
         *                           de minutos minutes.
         *                           Formato: XXhXX
         */
        $scope.minutes2Str = function (minutes) {
            var h = Math.floor(minutes / 60);
            var m = minutes - h * 60;

            return (h < 10 ? '0' + h : h) + 'h' + (m < 10 ? '0' + m : m);
        };

        $scope.clearAct = function () {
            $scope.newAct.periods = [];
            $scope.newAct.whatId = $scope.actAsocs[0].instID;
            $scope.newAct.whatName = $scope.actAsocs[0].name;
            $scope.newAct.whoId = session.getID();
            $scope.newAct.whoName = session.getProfile().firstName[0] + '. ' + session.getProfile().lastName;

            if($stateParams.id){
                $scope.whatIdToSearch = $stateParams.id;
                $scope.whoIdToSearch = $stateParams.id;
            }else{
                $scope.whatIdToSearch = 0;
                if(session.isLoggedIn()){
                    $scope.whoIdToSearch = session.getID();
                }else{
                    $scope.whoIdToSearch = 0;
                }
            }

            $scope.newActDays = [];
            $scope.addRemovePeriod(-1);
        };

        /**
         * today guarda la fecha de hoy para usos posteriores y referencia
         * @type {YWDarr}
         */
        var ajd = new Date();
        var d = ajd.getDate();
        var m = ajd.getMonth();
        var y = ajd.getFullYear();
        // Debe ser Mes/Dia/Año
        $scope.today = ((parseInt(m) + 1) < 10 ? '0' : '') + (parseInt(m) + 1) + '/' + (d < 10 ? '0' : '') + d + '/' + y;
        $scope.today = $scope.DobToYWDarr($scope.today);

        /**
        * thisWeek guarda la referencia de la semana actual para usos posteriores
        * @type {Integer}
        */
        $scope.thisDay = $scope.today[2];
        $scope.thisWeek = $scope.today[1];
        $scope.thisYear = $scope.today[0];
        $scope.searchYear = $scope.thisYear;

        $scope.$on('login', function () {
            $scope.newAct.whoId = session.getID();
            if($stateParams.id){
                $scope.whoIdToSearch = $stateParams.id;
            }else{
                $scope.whoIdToSearch = session.getID();
            }
        });

        $scope.$on('gotSubscriptions', function () {
            $scope.subscriptions = session.getSubscriptions();
            console.log($scope.subscriptions);
        });

        $scope.$on('gotTranslation', function () {
            $scope.translation = session.getTranslation();
            $scope.getAssociations();
        });

        $scope.$on('gotProfile', function () {
            $scope.newAct.whoName = session.getProfile().firstName[0] + '. ' + session.getProfile().lastName;
        });

        if(session.getSubscriptions()){
            $scope.subscriptions = session.getSubscriptions();
        }

        if (session.isLoggedIn()) {
            $scope.newAct.whoId = session.getID();
            if($stateParams.id){
                $scope.whoIdToSearch = $stateParams.id;
            }else{
                $scope.whoIdToSearch = session.getID();
            }
        }

        if (session.getTranslation()) {
            $scope.translation = session.getTranslation();
            $scope.newAct.whatName = session.getTranslation().labels['PRIVATE'];

            $scope.getAssociations();
        }

        if (session.getProfile()) {
            var profile = session.getProfile();
            $scope.newAct.whoName = profile.firstName[0] + '. ' + profile.lastName;
        }

        $scope.setDates($scope.thisWeek);
        $scope.newActCollapse = true;
        // Si no está definido no se pueden crear los campos al vuelo
        $scope.actCats = {};

        $scope.config = null;
        edt.updateConfig(function(err,config){
          if(err == null){
            $scope.config = config;
          }
        });

        /*	Cargar las semanas en el año, sólo una vez al cargar el controlador
         */
        var wn = $scope.weeksInYear();
        var i;
        $scope.weeks = Array.apply(null, new Array(wn)).map(function (_, i) {return i+1;});


        /**
         * Realiza el pedido de valores por única vez al cargar el controlador,
         * luego de que se haya generado el DOM. Importante!!
         *
         * TODO: Tal vez estas cosas sea mejor hacerlas al cargar la página inicial,
         * en ParentCtrl.js porque sino, cada vez que tocamos 'EDT' vuelve a cargar esto!
         */
        $scope.$on('$viewContentLoaded', function () {

          /**
           * Mostramos el calendario
           */
          $('#edt').prop('hidden', false);

          $scope.edtGetTimes();
        });

    });
})();
