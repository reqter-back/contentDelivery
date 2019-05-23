var express = require('express');

var router = express.Router();
var auth = require('../controllers/auth');
var view = require('../controllers/viewController');
var upload = require('../controllers/uploadController');

router.get("/view/:link", view.findByLink);
router.post("/upload/:link", upload.uploadContent);
router.get("/requests/:link", view.findByLink);
module.exports = router;