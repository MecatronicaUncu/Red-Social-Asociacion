var Admin = require('./_admin.js');

/**
 * Sends the ADMIN's parts.
 * @param {Object} req: The HTTP request's headers
 * @param {Object} res: The HTTP request's response headers
 * @param {Function} next: Function that executes next
 * @returns {void} Nothing.
 */
exports.getAdminNodes = function (req, res, next) {

    if (req.id) {
        ;
    } else {
        res.status(401).send('Unauthorized');
        return;
    }

    Admin.getAdminNodes(req.id, function (err, adminnodes) {
        if (err) {
            res.status(500).send('Error');
            return;
        }
        if (adminnodes) {
            res.status(200).send({adminnodes: adminnodes});
            return;
        }
        res.status(500).send('Error');
        return;
    });
};

exports.getNodeRelTypes = function(req, res, next){

  if(!req.id){
    res.status(401).send('Unauthorized');
    return;
  } else if(!req.query.memberof || req.query.memberof == ''){
    res.status(400).send('Missing MemberOf');
    return;
  }

  Admin.getNodeRelTypes(req.query.memberof, function(err, nodeTypes, relTypes){
    if(err || !nodeTypes || !relTypes){
      res.status(500).send('Error getting Node Rel Types');
      return;
    } else{
      res.status(200).send({nodetypes: nodeTypes, reltypes: relTypes});
    }
  });
};

exports.getNodeRelFields = function(req, res, next){

  if(!req.id){
    res.status(401).send('Unauthorized');
    return;
  } else if(!req.params.label){
    res.status(400).send('Missing Label');
    return;
  }

  Admin.getNodeRelFields(req.params.label, function(err, fields){
    if(err){
      res.status(500).send('Error getting fields');
      return;
    }else{
      console.log(fields);
      res.status(200).send({fields: fields});
      return;
    }
  });
};

/**
 * POST /newrel
 */
exports.newRel = function (req, res, next) {
    var relData = req.body;
    if (!relData.hasOwnProperty('instId')) {
        res.status(400).send('Missing Organism');
        return;
    }

    if (!relData.hasOwnProperty('usrID')) {
        res.status(400).send('Missing User');
        return;
    }

    if (!relData.hasOwnProperty('relType')) {
        res.status(400).send('Missing Relationship Details');
        return;
    }
    console.log(relData);
    Admin.newRel(relData, function (err) {
        if (err) {
            res.status(400).send('Error Creating Rel');
            return;
        } else {
            res.status(200).send('OK');
        }
    });
};

/**
 * POST /newpart
 */
exports.newPart = function (req, res, next) {
    var data = req.body;
    if (!data.hasOwnProperty('instID')) {
        res.status(400).send('Missing Organism');
        return;
    }

    if (!data.hasOwnProperty('partData')) {
        res.status(400).send('Missing Node Data');
        return;
    }

    if (!data.hasOwnProperty('label')) {
        res.status(400).send('Missing Node Label');
        return;
    }

    Admin.newPart(data, function (err, partID) {
        if (err) {
            res.status(400).send('Error Creating Node');
            return;
        } else if (partID) {
            res.status(200).send({idNEO: partID});
            return;
        } else {
            res.status(500).send('Database error');
            return;
        }
    });
};
