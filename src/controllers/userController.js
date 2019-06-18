const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const broker = require('./serviceBroker');
const culture = process.env.CULTURE | "fa-IR";

var wrapUser = function(user)
{
    if (user)
    {
        user.password = undefined;
        user.avatar = "/docs/img/uploads/" + user.avatar;
    }
    return user;
}

var sendVerifyCode = function(phoneNumber, code, deviceToken)
{
    if (process.env.NODE_ENV == "production")
    {
        broker.sendRPCMessage({body : {"phoneNumber" : phoneNumber, "code" : code}}, 'sendVerifyCode').then((result)=>{
            var obj = JSON.parse(result.toString('utf8'));
            if (!obj.success)
                console.log('Code not sent. Error code : ' + obj.error  + " response : " + obj.data);
            else
                console.log('Code(' + code + ') successfully sent to ' + phoneNumber);
        });
    }
    else
    {
        if (deviceToken)
        {
            broker.sendRPCMessage({body : {"device" : deviceToken, "message" : {
                "body" :"کد ورود شما به میواپ :‌" + code,
                 "title" : "کد ورود"
                },
                "data" : {
                 "type" : "LOGIN_VERIFICATION"
                }
            }}, 'sendPushMessage').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                    console.log('Push message not sent. Error code : ' + obj.error  + " response : " + obj.data);
                else
                    console.log('Push message successfully sent');
            });
        }
    }
}

exports.requestcode = [
   
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, code : 400, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'requestcode').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    return res.status(500);
                }
                else
                {
                    //Send activation code to user phone
                    sendVerifyCode(req.body.phoneNumber, obj.data.activation_code, obj.data.deviceToken ? obj.data.activation_code : req.body.deviceToken);
                    if (process.env.NODE_ENV == "production")
                        res.status(200).json({"success" : true, code : 200, "message" : "Code generated and sent to your phone"});
                    else
                        res.status(200).json({"success" : true, code : 200, "activation_code" : obj.data.activation_code, "message" : "Code generated and sent to your phone"});
                }
            }); 
        }
    }
]

exports.verifycode = [
    body('phoneNumber', "Phone number must not be empty").isMobilePhone(culture).withMessage('Invalid phone number.'),
    body('code', "Activation code must not be empty"),
    //Sanitize fields
    sanitizeBody('code').trim().escape(),
    sanitizeBody('phoneNumber').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, code : 400, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'verifycode').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid phoneNumber or code";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]

exports.login = [
    //Validate fields
//  body('username', "UserName must not be empty").isString().withMessage('Invalid username'),
//  body('password', "Password must not be empty").isLength({min : 8}).withMessage('Password length must be at least 8 charachters').isAlphanumeric().withMessage('Password must contain charachters and numbers'),
//  //Sanitize fields
//  sanitizeBody('username').trim().escape(),
//  sanitizeBody('password').trim().escape(),
 (req, res, next) =>{
 console.log(req.body);
 var errors = validationResult(req);
     if (!errors.isEmpty())
     {  
         //There are errors. send error result
         res.status(400).json({"success" : false, "error" : errors.message});
         return;
     }
     else
     {
         //#region Rabbit Implementation
         console.log('start connecting');
         
         broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'token').then((result)=>{
             var obj = JSON.parse(result.toString('utf8'));
             if (!obj.success)
             {
                 if (obj.error)
                     return res.status(404).json(obj);
                else
                    return res.status(401).json(obj);
             }
             else
             {
                 if (obj.data)
                 {
                     if (!obj.data.authenticated)
                     {
                        //Send activation code to user phone
                        sendVerifyCode(req.body.phoneNumber, obj.data.activation_code, req.body.deviceToken);
                        if (process.env.NODE_ENV == "production")
                            res.status(200).json({success : true});
                        else
                            res.status(200).json({access_token : obj.data.access_token, authenticated : obj.data.authenticated, token_type : obj.data.token_type, activation_code : obj.data.activation_code});
                     }
                     else
                     {
                        res.status(200).json({access_token : obj.data.access_token, authenticated : true, token_type : obj.data.token_type, refresh_token : obj.data.refresh_token});
                     }
                 }
                 else
                 {
                     res.status(400).json({});
                 }
             }
         });
     }
}
];

exports.register = [
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            console.log('add user started.')
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'register').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                    {
                        return res.status(500).json(obj);
                    }
                }
                else
                {
                    res.status(201).json(wrapUser(obj.data));
                }
            });
        };
    }
];

exports.changecity = [
    body('id', "Id must not be empty"),
    body('citycode', "City code must not be empty").isNumeric().withMessage('Invalid city code.'),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    sanitizeBody('citycode').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'changecity').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            }); 
        }
    }
]

exports.changenumber = [
    body('id', "Id must not be empty"),
    body('phoneNumber', "Phone number must not be empty"),
    body('code', "code must not be empty"),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    sanitizeBody('phoneNumber').trim().escape(),
    sanitizeBody('code').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'changenumber').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]

exports.changeavatar = [
    body('id', "Id must not be empty"),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    (req, res, next) =>{
        console.log(JSON.stringify(req.file));
        if (req.file === undefined || req.file == null)
        {
            //There is no avatar in the request
            res.status(400).json({"success" : false, "error" : "Avatar must not be null"});
            return;
        }
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId ,id : req.body.id, avatar : req.file}, 'changeavatar').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]

exports.updateprofile = [
    body('id', "Id must not be empty"),
    body('first_name', "First name must not be empty"),
    body('last_name', "Last name must not be empty"),
    body('address', "Address must not be empty"),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('last_name').trim().escape(),
    sanitizeBody('address').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'updateprofile').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]

exports.changelanguage = [
    body('id', "Id must not be empty"),
    body('language', "Language must not be empty"),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    sanitizeBody('language').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'changelanguage').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]

exports.changenotification = [
    body('id', "Id must not be empty"),
    body('notification', "notify must not be empty"),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'changenotification').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]

exports.deleteaccount = [
    body('id', "Id must not be empty"),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, code : 400, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'deleteaccount').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json({"success" : true, code : 200, "message" : "You successfully deleted your account. You will no longer have access to your account"});
                }
            });
        }
    }
]

exports.locationchanged = [
    body('id', "Id must not be empty"),
    body('location', "Location must not be empty"),
    //Sanitize fields
    sanitizeBody('id').trim().escape(),
    sanitizeBody('location').trim().escape(),
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.body}, 'locationchanged').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "invalid id";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]

exports.getuserinfo = [
    (req, res, next) =>{
        var errors = validationResult(req);
        if (!errors.isEmpty())
        {  
            //There are errors. send error result
            res.status(400).json({"success" : false, "error" : errors});
            return;
        }
        else
        {
            broker.sendRPCMessage({clientId : req.clientId, body : req.query}, 'findbyphone').then((result)=>{
                var obj = JSON.parse(result.toString('utf8'));
                if (!obj.success)
                {
                    if (obj.error)
                        return res.status(500).json(obj);
                    else
                    {
                        obj.error = "Invalid phone number";
                        res.status(404).json(obj);
                    }
                }
                else
                {
                    res.status(200).json(wrapUser(obj.data));
                }
            });
        }
    }
]