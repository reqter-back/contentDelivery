const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const broker = require('./serviceBroker');
var Contents = require('../models/content');
var Requests = require('../models/request');
var uniqid = require('uniqid')

// exports.submitRequest = async function(req, cb) {
//     console.log(req);
//     var request = await Requests.findOne({"sys.link" : req.body.request}).exec();
//     if (!request)
//     {
//         result.success = false;
//         result.data =  undefined;
//         result.error = "Invalid request";
//         return result;
//     }
//     var content = new Contents({
//         sys : {},
//         fields: req.body.fields,
//         contentType : request.contentType,
//         requestId : request._id,
//         status : "draft",
//         statusLog : [],
//         userinfo : req.body.userinfo
//     });

//     var newStatus = {}
//     newStatus.code = "draft";
//     newStatus.applyDate = new Date();
//     newStatus.user = req.userId;
//     newStatus.description = "Item created";
//     content.status = "draft";
//     content.statusLog.push(newStatus);

//     content.sys.type = "content";
//     content.sys.link = uniqid();
//     content.sys.spaceId = req.spaceid;
//     content.sys.issuer = req.userId;
//     content.sys.issueDate = new Date();

//     content.save(function(err){
//         var result = {success : false, data : null, error : null };
//         if (err)
//         {
//             result.success = false;
//             result.data =  undefined;
//             result.error = err;
//             console.log(err);
//             return result; 
//         }
//         //Successfull. 
//         //Publish user registered event
//         result.success = true;
//         result.error = undefined;
//         result.data =  content;
//         return result; 
//     });


// }