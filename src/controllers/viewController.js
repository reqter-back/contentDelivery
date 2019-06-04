const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const broker = require('./serviceBroker');
exports.findByLink = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : {link : req.query.link}}, 'getrequestbylink').then((result)=>{
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

exports.getDetailsByLink = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : {link : req.query.link}}, 'getrequestdetailsbylink').then((result)=>{
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

exports.getAllRequests = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'getallrequests').then((result)=>{
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

exports.filterRequests = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'filterRequests').then((result)=>{
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

exports.getCategories = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'getcategories').then((result)=>{
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

exports.getContentTypes = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'getcontenttypes').then((result)=>{
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
exports.findContentByLink = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : {link : req.query.link}}, 'getcontentbylink').then((result)=>{
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

exports.init = function(req, res, next) {
    broker.sendRPCMessage({clientId : req.clientId, body : {link : req.query.link}}, 'initrequests').then((result)=>{
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
