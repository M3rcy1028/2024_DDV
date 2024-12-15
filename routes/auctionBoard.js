var express = require('express');
var router = express.Router();

var listController = require('../controllers/auctionController/auctionListController.js');
var readController = require('../controllers/auctionController/auctionReadController.js');
var writeController = require('../controllers/auctionController/auctionWriteController.js');
var searchController = require('../controllers/auctionController/auctionSearchController.js');

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
router.get('/auctionList', listController.getListFirst);

//글쓰기 전체 조회 화면 (idx 페이지)
router.get('/auctionList/:page', listController.getList);

// //카테고리별 조회
// router.get('/auctionList/category/:categoryNum', listController.getCategoryListFirst);

// //카테고리별 조회 (idx 페이지)
// router.get('/auctionList/category/:categoryNum/:page', listController.getCategoryList);

//글쓰기 조회 화면
router.get('/auctionRead/:Ano', readController.readData);

//글쓰기 화면 (GET)
router.get('/auctionWrite', writeController.writeForm);

//글쓰기 화면 (POST)
router.post('/auctionWrite', upload.single("image"), writeController.writeData);

// //글쓰기 수정 화면 (GET)
// router.get('/auctionUpdate', updateController.updateForm);

// //글쓰기 수정 화면 (POST)
// router.post('/auctionUpdate', upload.single("image"), (req, res) => { updateController.updateData(req, res) });

// //글 삭제 (POST)
// router.post('/auctionDelete', deleteController.deleteData);

//글 검색 (POST)
router.post('/search', searchController.searchData);

// //채팅방 생성
// router.post('/newchat', newchatController.createChat);

module.exports = router;