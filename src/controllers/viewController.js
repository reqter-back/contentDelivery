const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const broker = require('./serviceBroker');
exports.findByLink = function(req, res, next) {
    broker.sendRPCMessage({body : {link : req.query.link}}, 'getrequestbylink').then((result)=>{
        var obj = JSON.parse(result.toString('utf8'));
        if (!obj.success)
        {
            if (obj.error)
                return res.status(500).json(obj);
            else
            {
                res.status(404).json(obj);
            }
        }
        else
        {
            res.status(200).json(obj.data);
        }
    });
}

