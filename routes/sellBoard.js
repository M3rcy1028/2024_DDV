var express = require('express');
var router = express.Router();

var listController = require('../controllers/sellListController.js');
var readController = require('../controllers/sellReadController.js');
var writeController = require('../controllers/sellWriteController.js');
var updateController = require('../controllers/sellUpdateController.js');
var deleteController = require('../controllers/sellDeleteController.js');

const multer = require('multer');
const path = require("path");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/product");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });

//글쓰기 전체 조회 화면
router.get('/sellList', listController.getListFirst);

//글쓰기 전체 조회 화면 (idx 페이지)
router.get('/sellList/:page', listController.getList);

//카테고리별 조회
router.get('/sellList/category/:categoryNum', listController.getCategoryList);

//글쓰기 조회 화면
router.get('/sellRead/:Bno', readController.readData);

//글쓰기 화면 (GET)
router.get('/sellWrite', writeController.writeForm);

//글쓰기 화면 (POST)
router.post('/sellWrite', upload.single("image"), writeController.writeData);

//글쓰기 수정 화면 (GET)
router.get('/sellUpdate', updateController.updateForm);

//글쓰기 수정 화면 (POST)
router.post('/sellUpdate', upload.single("image"), (req, res) => { updateController.updateData(req, res) });

//글 삭제 (POST)
router.post('/sellDelete', deleteController.deleteData);

module.exports = router;