var express = require("express");
var router = express.Router();
var controller = require("../controllers/contentController");
var auth = require("../controllers/auth");
router.get("/search", auth.verifyToken, controller.filter);
router.get("/query", auth.verifyToken, controller.query);
router.get("/template/:template", auth.verifyToken, controller.loadByTemplate);
module.exports = router;
