var express = require("express");
var router = express.Router();
var controller = require("../controllers/contentController");
var auth = require("../controllers/auth");
router.get("/search", auth.verifyToken, controller.filter);
module.exports = router;
