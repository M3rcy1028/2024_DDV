var express = require('express');
var router = express.Router();
var path = require('path');

router.use('/bootstrap', express.static(path.join(__dirname, "../node_modules/bootstrap/dist")));

module.exports = router;