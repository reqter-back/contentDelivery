var express = require('express');
var cors = require('cors')
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var compression = require('compression');

var app = express();

app.use(compression()); //Compress all routes
app.use(helmet());
app.use(cors());

var view = require('./routes/api');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/v1', view);
module.exports = app;
