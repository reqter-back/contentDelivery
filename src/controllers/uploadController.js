const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const broker = require('./serviceBroker');

exports.submitRequest = function(req, res, next) {
    var request = new Requests({
        sys : {},
        contentType : req.body.contentType,
        category : req.body.category,
        title : req.body.title,
        description : req.body.description,
        longDesc : {},
        longDesc : req.body.longDesc,
        thumbnail : req.body.thumbnail,
        attachments : req.body.attachments,
        receiver : req.body.receiver,
        status : "draft",
        statusLog : [],
        settings : req.body.settings
    });

    var newStatus = {}
    newStatus.code = "draft";
    newStatus.applyDate = new Date();
    newStatus.user = req.userId;
    newStatus.description = "Item created";
    request.status = "draft";
    request.statusLog.push(newStatus);

    request.sys.type = "request";
    request.sys.link = uniqid();
    request.sys.spaceId = req.spaceid;
    request.sys.issuer = req.userId;
    request.sys.issueDate = new Date();
    request.sys.spaceId = req.spaceId;
    request.save(function(err){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        //Successfull. 
        //Publish user registered event
        result.success = true;
        result.error = undefined;
        result.data =  request;
        cb(result); 
    });
}