var express = require("express");
var cors = require("cors");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var compression = require("compression");
var graphqlHTTP = require("express-graphql");
var db = require("./db/init-db");
var config = require("./config");
const { schema } = require("./graphql/schema");
var auth = require("./controllers/auth");

var app = express();

app.use(compression()); //Compress all routes
app.use(helmet());
app.use(cors());

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
db();
const contents = require("./routes/contents");
app.post(
  "/graphql",
  auth.verifyToken,
  graphqlHTTP({
    schema,
    graphiql: false,
    pretty: true
  })
);
app.get(
  "/graphql",
  auth.verifyToken,
  graphqlHTTP({
    schema,
    graphiql: true,
    pretty: true
  })
);
app.use("/contents", contents);
module.exports = app;
