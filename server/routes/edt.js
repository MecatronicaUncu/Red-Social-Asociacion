var Edt = require('./_edt.js');
var path = require('path');
var VCalendar = require('cozy-ical').VCalendar;
var VEvent = require('cozy-ical').VEvent;
var fs = require('fs'); //FILESYSTEM

/**
* Toma un string de formato 'XXhXX' (donde X es un dígito [0-9]) y devuelve
* horas y minutos.
* @param  {String} t
* @return {Array} [hora,minutos]
*/
var getminutes = function (t) {
   var mt = t.split('h');
   return [parseInt(mt[0]), parseInt(mt[1])];
};

/**
* Convierte un array de tipo [Year, Week, DayOfWeek] (ISO 8601) en un objeto de
* tipo Date
* @param {Array} AYWD ([Year, Week, DayOfWeek])
* @return {Date Object} Dob
*/
var YWDarrToDob = function (AYWD) { // Arg : ISO 8601 : [Y, W, D]
   var DOb = new Date(+AYWD[0], 0, 3);  // Jan 3
   if (isNaN(DOb))
       return false;
   DOb.setDate(3 - DOb.getDay() + (AYWD[1] - 1) * 7 + +AYWD[2]);
   return DOb;
};

exports.getPlaces = function(req, res, next){
  res.status(501).send('Not Implemented');
};

exports.getEdtConfig = function(req, res, next){
    
    //TODO: Configuracion personal del usuario
    
    var configFile = path.resolve(path.join(__dirname, '../config/edtConfig.json'));
    
    fs.readFile(configFile, 'utf-8', function (err, config) {
        if (err){
            console.log(err);
            res.sendStatus(500);
        }
        else{
            console.log(config);
            res.status(200).send({config: JSON.parse(config)});
        }
    });  
};

exports.getTimesIcal = function(req, res, next){
    
    if( req.query.whatId && req.query.whoId && 
        req.query.week && req.query.year && req.query.whatName)
        ;
    else{
        res.status(401).send('Missing information');
        return;
    }
    
    var timeData = {
        //TODO: Extender a array de whats
        whatName: req.query.whatName,
        //whoName: req.query.whoName,
        whatId: req.query.whatId,
        whoId: req.query.whoId,
        week: req.query.week,
        year: req.query.year,
    };
      
    Edt.getTimes(timeData, function (err, times) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        } else {
			try{
				console.log(times);
				var cal = new VCalendar({
					organization: 'TimesApp',
					title: timeData.whatName
				});
				var tmpDate,tmpHMin,startDate,endDate;
				times.forEach(function(time){
					tmpDate = YWDarrToDob([time.year,time.week,time.day])
					tmpHMin = getminutes(time.from);
					startDate = new Date(   tmpDate.getFullYear(), 
											tmpDate.getMonth(),
											tmpDate.getDate(),
											tmpHMin[0]+Math.floor(time.timezone/60), tmpHMin[1]+time.timezone%60, 0);
					tmpHMin = getminutes(time.to);                        
					endDate = new Date(     tmpDate.getFullYear(), 
											tmpDate.getMonth(),
											tmpDate.getDate(),
											tmpHMin[0]+Math.floor(time.timezone/60), tmpHMin[1]+time.timezone%60, 0);
											
					var vevent = new VEvent({
						stampDate: 0,
						startDate: startDate,
						endDate: endDate,
						summary: time.type,
						description: time.desc,
						//location: "Test Location",
						uid: time.idNEO
					});

					cal.add(vevent);
				});

				console.log(cal.toString());

				fs.writeFile("/tmp/ical.ics", cal.toString(), function(err) {
					if(err) {
						console.log(err);
						res.status(500).send(err);
						return;
					}else{
						var stat = fs.statSync('/tmp/ical.ics');
						res.writeHead(200, {
							  'Content-Type': 'text/calendar', 
							  'Content-Length': stat.size,
							  'Content-disposition' : 'attachment; filename="calendar.ics"'
						});
						var stream = fs.createReadStream( '/tmp/ical.ics', { bufferSize: 64 * 1024 });
						//res.attachment('/tmp/ical.ics');
						stream.pipe(res);
						//res.download('/tmp/ical.ics','calendar.ics');
					}
				}); 
			}catch(err){
				console.log(err);
				res.status(500).send(err);
			}
        }
    });
};

exports.getTimes = function(req, res, next){
  
    var timeData = {
        whatId: req.query.whatId,
        whoId: req.query.whoId,
        week: req.query.week,
        year: req.query.year,
    };
      
    Edt.getTimes(timeData, function (err, times) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        } else {
            console.log(times);
            res.status(200).send({times: times});
            return;
        }
    });
};

exports.getActivityTypes = function (req, res, next) {

  if (!req.id) {
    res.status(401).send('Unauthorized');
    return;
  } else if (!req.query.parent) {
    res.status(400).send('Missing parent');
    return;
  }

  Edt.getActivityTypes(req.query.parent, function (err, activityTypes) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    } else {
      console.log(activityTypes);
      res.status(200).send({activityTypes: activityTypes});
      return;
    }
  });
};

exports.newActivity = function (req, res, next) {
    var acts = req.body.activities;

    Edt.newActivity(acts, function (err, result) {
        if (err) {
			console.log(err);
            res.status(500).send(err);
            return;
        } else {
            res.status(200).send('OK');
            return;
        }
    });
};
