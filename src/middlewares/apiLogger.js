const winston = require("winston");
require('winston-mongodb');
const dotenv = require('dotenv');
dotenv.config();

// Define a mongondb winston logger 
const dbConnString = process.env.LOG_DB_CONNECTION_STRING || "mongodb+srv://backupLogDB:9SEnbWEu2qmGRYpo@cluster0-ljo1h.mongodb.net/backupLogDB?retryWrites=true&w=majority";

const winstonApiLogger = winston.createLogger({
	level: 'silly',
	format: winston.format.json(),
	// defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.MongoDB({
			db: dbConnString,
			level: 'silly',
			options: {
				useUnifiedTopology: true
			},
			collection: process.env.API_LOGGER_COLLECTION_NAME || 'defaultCollection',
			storeHost: true
		})
	]
});


function APIlogger(req, res, next){
    // Note: The commented function below is a function which can used to set Collection Names Dynamically.
    // setDatabaseCollectionName(req);

    // override send function
    let temp = res.send;

    res.send = function () {
        // the try-catch block make sure that the exception will not stopped the functionality of res.send
        try {
            // Set res.body
            let resBody = (arguments.length) ? arguments[0] : null;     // this get the argument which is sent as res.send(arg) argument
            res.body = resBody;

            let data = prepareLogData(req, res);
            
            if (!req.wasLogged) {
                logger(data.logLevel, data.reqLog, data.resLog);
                req.wasLogged = true;
            }

        } catch (e)  {
            console.log('API Logger Error. See this.', e);
        }

        temp.apply(this, arguments);
    }

    return next();
}

function prepareLogData(req,res) {
    let reqLog = {
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body
    }
    , resLog = {
        body: res.body,
        status: res.statusCode
    };

    let logLevel = null;
    if (res.statusCode >= 500) {
        logLevel = 'error';
    } else if (res.statusCode >= 400) {
        logLevel = 'warn';
    } else if (res.statusCode >= 100) {
        logLevel = 'info';
    }

    return {
        logLevel: logLevel,
        reqLog: reqLog,
        resLog: resLog
    };

}

function logger(logLevel, reqLog, resLog) {
    try{
        winstonApiLogger.log(logLevel, 
            reqLog.url,
            {metadata: {
                req: reqLog,
                res: resLog
            }}
        );
    } catch (e) {
        console.log("Error Occured when logging using winston. Error:", e );
    }
}

function setDatabaseCollectionName(req) {
    // Note: This is a function which can used to set Collection Names Dynamically.
    // An example Provided Below
    
    // let originalUrl = req.originalUrl;
    
    // winstonApiLogger.transports[0].collection = process.env.API_LOGGER_COLLECTION_NAME || 'defaultCollection';

    // if (originalUrl.startsWith('/auth')) {
    //     winstonApiLogger.transports[0].collection = 'auth Logger';
    // } else if (originalUrl.startsWith('/opportunity')) {
    //     winstonApiLogger.transports[0].collection = 'opportunity Logger';
    // }
}


module.exports = APIlogger;