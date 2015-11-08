////////////////////////////////////////////////////////////////
//                                                            //
// Módulo del server que se comunica la base de datos MongoDB //
//                                                            //
////////////////////////////////////////////////////////////////

var mongo = require('mongodb').MongoClient;
var Users = require('./users.js');

function isIn(arr,obj) {
    return (arr.indexOf(obj) != -1);
}
/** @type {String} URL de conexión a la base de datos MongoDB */
var mdburl = 'mongodb://localhost:27017/test';
/** @type {MongoDB} Objeto que hace referencia a la base de datos utilizada */
var db = null;

/**
 * Realiza la conexión con la base de datos MongoDB local y guarda la referencia
 * en db
 * 
 * @param  {String} mdburl URL de conexión
 * @param  {Function} callback Callback al que le llega la referencia a la base de
 * datos y el error en el caso correspondiente
 */
mongo.connect(mdburl, function(err, mdb) {
	if(err){
		console.log('Error connecting to mongodb server');
	} else {
		console.log('Connected correctly to mongodb server');
		db = mdb;
	}
});

/**
 * Realiza una búsqueda de las categorías posibles en la BDD, aplicando un filtro.
 * Por ejemplo, sólo las categorías clasificadas como 'Person', o 'Activity'
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 */
exports.getTypes = function (req, res, next) {

	var partLabel = req.query.partLabel;
	var col = db.collection('ActivityTypes');
    
	col.find({master: {$in: [partLabel,'ALL']}}, {_id:0,label:1}).toArray(function(err, docs) {
		if (err){
			res.send(500,'Error getting activity types');
			return;
		} else {
			res.send(200, docs);
			return;
		}
  });
};

/**
 * Realiza una búsqueda de los horarios para la semana, y el elemento indicado
 * (ya sea una persona o una materia por ejemplo).
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 *
 * TODO: Buscar por ID!
 */
exports.getTimes = function(req, res, next){

	var col = db.collection('Activities');
	var id = req.query.id;
	var week = parseInt(req.query.week);
	
	col.find({$and: [	{$or: [{whatID: id}, {whoID: id}, {whereID: id}]}, 
						{"when.week":week},
						{"when.year":(new Date()).getFullYear()}] },
						{_id:0}).toArray(function(err, docs) {
		if (err){
				res.send(500,'Error MONGO getTimes');
				return;
		} else {
			console.log(docs);
			res.send(200, {data:docs});
			return;
		}
  	});
};

/**
 * Realiza la búsqueda de la configuración de las franjas horarias. Límites por
 * un lado y colores según se pida, para un tipo de actividad indicada.
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 */
exports.getConfig = function(req, res, next){

	var col = db.collection('Config');	
	var limits;
	col.find({label: 'EDT_LIMITS'},{_id:0}).toArray(function(err,lim) {
		if(err) {
			res.send(500,'Error MONGO getConfig 1');
			return;
		} else {
			limits = lim[0].limits;
			col.find({label: 'EDT_COLORS'},{_id:0}).toArray(function(err,docs) {
				if(err) {
					res.send(500,'Error MONGO getConfig 2');
					return;
				} else {
					console.log(docs[0].colors);
					res.send(200, {limits:limits, colors:docs[0].colors});
				}
			});
		}
	});
};

/**
 * Realiza una búsqueda de los lugares posibles para desarrollarse las
 * actividades.
 * 
 * @param  {Object}   req  HTTP Request.
 * @param  {Object}   res  HTTP Response
 * @param  {Function} next Siguiente función a ejecutar, si existiece.
 */
exports.getPlaces = function (req, res, next) {

	var col = db.collection('Places');

	col.find({},{_id:0}).toArray(function(err, docs) {
		if (err){
			res.send(500,'Error MONGO getPlaces');
			return;
		} else {
			res.send(200, {data:docs});
			return;
		}
  });
};

exports.newActivity = function(req, res, next){
  
    var col = db.collection('Activities');
    //console.log(req.body);
    var acts = req.body.activities;
    /** Weeks in year */
    var wiy = req.body.wiy;
    
    res.send(500);
    /*
    acts.forEach(function(act){
       // Check if next year 
        if(act.date.week == wiy){
            act.date.week = step;
            act.date.year++;
        } else {
            act.date.week += step;
        }

        console.log('inserting:');
        console.log(act);
        col.insert(act, function(err){
            if(err){
                res.send(500,'Error MONGO newActivity');
                return;
            }
        }); 
    });
    */
};

// Dejar para el registro de universidades y ADMINS
exports.checkUniqueKey = function(email,uniqueKey, next){
    
    var col = db.collection('UniqueKeys');
    var found = false;
    col.find({email:email, key:uniqueKey}).toArray(function(err, docs) {
        if (err){
            found = false;
            next(found);
        } else {
            if(docs.length === 0){
                found = false;
                next(found);
            } else {
                found = true;
                next(found);
            }
        }
        
        return;
    });
};

// Dejar para el registro de universidades y ADMINS
exports.deleteUniqueKey = function(email,uniqueKey){
    
    var col = db.collection('UniqueKeys');
    col.remove({email:email, key:uniqueKey}, function(err, docs) {
        if (err){
            console.log(err);
        } else {
            return;
        }
        
        return;
    });
};

//exports.register = function(idNEO,nodedata,nodetype,callback){
//  
//    var col = db.collection(nodetype);
//    /**
//     * TODO: Interrumpir el SignUp si no se registra en MongoDB, para
//     *       evitar incoherencias.
//     */
//    nodedata.idNEO = idNEO;
//    col.insert(nodedata, function(err){
//       if(err) {
//           console.log(err);
//           return callback(true);
//       }else{
//           return callback(false,idNEO);
//       }
//    });
//    /*
//    col.insert({firstName:user['firstName'], lastName:user['lastName'], idNEO:idNEO, email:user['email']}, function(err){
//       if(err) {
//           console.log(err);
//       }
//    });
//    */
//};

//exports.getProfile = function(req, res, next){
//	
//    var idNEO;
//    var filter = {_id:0, idNEO:0};
//    
//    if(req.params.id){
//        idNEO = parseInt(req.params.id);
//        filter.email = 0;
//    }else if(req.id){
//        idNEO = req.id;
//    }else{
//        res.send(401, 'Unauthorized');
//        return;
//    }
//	var col = db.collection('Users');
//    
//    console.log(filter,idNEO);
//	
//	col.find({idNEO:idNEO},filter).toArray(function(err, docs) {
//		if (err){
//            console.log(err);
//			res.send(500,'Error MONGO getProfile');
//			return;
//		} else {
//            console.log(docs);
//			if(docs.length == 0){
//				res.send(500,'Error Profile not found');
//			}else{
//				res.send(200, docs[0]);
//			}
//			return;
//		}
//  });
//};

//exports.changeProfile = function(req, res, next){
//	
//	if(!Users.sameUser(req.body.id,req,res)){
//        res.send(401,'Unauthorized');
//        return;
//    }
//	
//	var col = db.collection('Users');
//	console.log(req.body);
//	var changes = req.body.changes;
//	var idNEO = req.body.id;
//
//	col.update({idNEO:idNEO},{$set: changes}, function(err, docs) {
//		if (err){
//			res.send(500,'Error MONGO changeProfile');
//			return;
//		} else {
//			res.send(200);
//			return;
//		}
//	});
//};

//exports.search = function(req, res, next){
//	       
//    // TODO: BUSCAR OTRAS COSAS COMO UNIVERSIDADES
//    // TODO: No mostrarse a uno mismo ?
//    var col = db.collection('Users');
//    
//    var filter = new RegExp('.*'+req.query['term']+'.*','i');
//    
//    col.find({$or: [{firstName: filter}, {lastName: filter},
//    	{profession: filter}, {email: filter}]},{_id:0}).toArray(function(err, docs) {
//		if (err){
//			res.send(500,'Error MONGO getPlaces');
//			return;
//		} else {
//			console.log(docs);
//			res.send(200, {results:docs});
//			return;
//		}
//  	});
//};

//exports.getThey = function(req, res, next){
//	
//    var col = db.collection('Users');
//    
//    col.find({},{_id:0}).limit(5).toArray(function(err, docs) {
//		if (err){
//			res.send(500,'Error MONGO getThey');
//			return;
//		} else {
//			res.send(200, {they:docs});
//			return;
//		}
//  	});
//};

exports.getNodeTypes = function(req, res, next){
	
	if(req.id){
		Users.isAdmin(req.id,function(admin){
			if(!admin){
				res.send(401,'Unauthorized');
	        	return;
	        }
	 	});
	 }else{
	 	res.send(401,'Unauthorized');
	    return;
	 }
	
	var col = db.collection('NodeTypes');
    var filter = req.query.memberof;
    
    var modifier = { '_id': 0};
    //modifier['name.' + req.lang] = 1;
    modifier['name.' + 'ES'] = 1;
    modifier['label'] = 1;
    modifier['icon'] = 1;
    col.find({memberof: filter},modifier).toArray(function(err, docs) {
		if (err){
			res.send(500,'Error MONGO getNodeTypes');
			return;
		} else {
			res.send(200, {nodetypes:docs});
			return;
		}
  	});
};

exports.getRelTypes = function(req, res, next){
	
	if(req.id){
		Users.isAdmin(req.id,function(admin){
			if(!admin){
				res.send(401,'Unauthorized');
	        	return;
	        }
	 	});
	 }else{
	 	res.send(401,'Unauthorized');
	    return;
	 }
	
	var col = db.collection('RelTypes');
    var filter = req.query.memberof;
    
    var modifier = { '_id': 0};
    modifier['label'] = 1;
    modifier['icon'] = 1;
    col.find({memberof: filter},modifier).toArray(function(err, docs) {
		if (err){
			res.send(500,'Error MONGO getRelTypes');
			return;
		} else {
			res.send(200, {reltypes:docs});
			return;
		}
  	});
};

exports.getNodeRelTypes = function(req, res, next){
	
	if(req.id){
		Users.isAdmin(req.id,function(admin){
			if(!admin){
				res.send(401,'Unauthorized');
	        	return;
	        }
	 	});
	 }else{
	 	res.send(401,'Unauthorized');
	    return;
	 }
	
	var filter = req.query.memberof;
    var nodes = [];
    var col = db.collection('RelTypes');
    var modifier = { '_id': 0, label: 1, relParams: 1};
    col.find({memberof: filter},modifier).toArray(function(err, docs) {
		if (err){
			res.send(500,'Error MONGO getRelTypes');
			return;
		} else {
			nodes = docs;
			col = db.collection('NodeTypes');
		  	col.find({memberof: filter},modifier).toArray(function(err, docs) {
				if (err){
					res.send(500,'Error MONGO getNodeTypes');
					return;
				} else {
					res.send(200, {reltypes:nodes, nodetypes:docs});
					return;
				}
		  	});
			return;
		}
  	});
};

//exports.getLanguage = function(_idNEO, next){
//	
//	var col = db.collection('Users');
//    console.log(_idNEO);
//    col.find({idNEO: parseInt(_idNEO)},{_id:0, lang:1}).toArray(function(err, docs) {
//		if (err){
//			return next(err);
//		} else {
//			return next(null,docs[0].lang);
//		}
//  	});
//};

//exports.getAdminNodesData = function(req, res, nodes){
//	
//	// TODO: Ver si hay una forma mas eficiente
//	var col = db.collection('Parts');
//	var ors = []; 
//	nodes.forEach(function(el){
//		ors.push({idNEO: el.idNEO});
//	});
//	
//	col.find({$or: ors},{_id:0}).toArray(function(err, docs) {
//		if (err){
//			res.send(500, 'Error');
//			return;
//		} else {
//			res.send(200, {adminnodesdata: docs});
//			return;
//		}
//	});
//};

//exports.getNodeContentsData = function(req, res, content){
//	
//	var col;
//	
//	var partCursor;
//	var usrCursor;
//	
//    //Se envia como respuesta HTTP. Dejar vacio
//	var parts = [];
//	var rels = [];
//	var institutionsIDs = [];
//    
//    var PartIn = content.parts;
//	var RelIn = [];
//	
//	var labelMap = {};
//	var institutionsIdMap = {};
//	var institutionsMap = {};
//	
//	content.rels.forEach(function(rel){
//        RelIn = RelIn.concat(RelIn,rel.idNEO);
//		rel.idNEO.forEach(function(idNEO){
//			labelMap[idNEO] = rel.reltype;
//			institutionsIdMap[rel.idNEO] = rel.instID;
//		});
//		if(rel.instID){
//			institutionsIDs.push(rel.instID);
//			PartIn.push(rel.instID);
//		}
//	});
//	
//	col = db.collection('Parts');	
//	partCursor = col.find({idNEO: {$in: PartIn}},{_id:0});
//	col = db.collection('Users');
//	usrCursor = col.find({idNEO: {$in: RelIn}},{_id:0});
//  
//    usrCursor.each(function(err, usr){
//        if (err){
//            throw err;
//            res.send(500, 'Error');
//            return;
//        }
//        if(usr == null){
//            usrCursor.rewind();
//            usrCursor.toArray(function(err, usrs){
//                if (err){
//                    throw err;
//                    res.send(500, 'Error');
//                    return;
//                }else {
//                    partCursor.each(function(err, part){
//                        if (err){
//                            throw err;
//                            res.send(500, 'Error');
//                            return;
//                        }
//                        if(part == null){
//                            rels.forEach(function(rel){
//                                rel['institution'] = institutionsMap[rel['institution']];
//                            });
//                            res.send(200, {parts:parts, rels:rels});
//                            return;
//                        }
//                        if(isIn(institutionsIDs,part.idNEO)){	
//                            institutionsMap[part.idNEO] = part.name;
//                        }else {
//                            parts.push(part);
//                        }
//                    });
//                }
//            });
//            return;
//        }
//        usr['reltype'] = labelMap[usr.idNEO];
//        usr['institution'] = institutionsIdMap[usr.idNEO];
//        rels.push(usr);				
//    });
//};

exports.getFields = function(req, res, next){
	
	var filter = '';
	if(req.params.label){
		filter = req.params.label;
    }
	else
		res.send(500, 'ERROR');
		
        var col = db.collection('NodeTypes');
 	
        col.find({label: filter},{_id:0,formFields:1}).toArray(function(err, node){
            if(err){
                throw err;
                res.send(500, 'ERROR');
            }else{
                if(node.length === 1){
                    res.send(200, {formFields:node[0].formFields});
                }
                else
                    res.send(500, 'ERROR: Fields not found');
            }
        });
};

exports.getTranslation = function(req,res,next){
    
    var lang = req.params.lang;
    if(!lang){
        res.send(500, 'Error');
    }
    
    var col = db.collection('Translations');
    col.find({lang: lang},{_id:0,lang:0}).toArray(function(err,trans){
       if(err){
           console.log(err);
           res.send(500, 'Error Getting Translations');
       }else {
           res.send(200, {translation:trans[0]});
       }
    });
};

//exports.newRel = function(relData,callback){
//    
//    var col = db.collection('Users');
//    
//    col.update({idNEO: relData.usrID},{$addToSet: {relations: {inst: relData.inst, label: relData.relType}}},function(err){
//       if(err){
//           console.log(err);
//           return callback(true);
//       }else {
//           return callback(false);
//       }
//    });
//};

//exports.removeRel = function(relData,callback){
//    
//    var col = db.collection('Users');
//    
//    col.update({idNEO: relData.idNEO},{$pull: {relations: {instID: relData.instID, label: relData.label}}},function(err){
//        if(err){
//           console.log(err);
//           return callback(true);
//       }else {
//           return callback(false);
//       }
//    });
//};

//exports.getAsocs = function(req, res, next){
//    
//    if(!req.id){
//        res.send(401,'Unauthorized');
//        return;
//    }
//    
//    var col = db.collection('Users');
//    col.find({idNEO: req.id},{}).toArray(function(err,docs){
//        if(err){
//            console.log(err);
//            res.send(500, 'Database Error');
//        }else{
//            console.log(docs);
//            //Para tener la opción de crear la actividad para uno mismo.
//            if(docs[0].relations){
//                res.send(200,docs[0].relations.concat([{inst: {idNEO:-1,label:'PRIVATE'}, label:'PRIVATE'}]));
//            }else{
//                res.send(200, [[{inst: {idNEO:-1,label:'PRIVATE'}, label:'PRIVATE'}]]);
//            }
//        }
//    });
//};