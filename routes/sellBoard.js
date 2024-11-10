var express = require('express');
var router = express.Router();
var listController = require('../controllers/sellListController.js');
var readController = require('../controllers/sellReadController.js');

//글쓰기 전체 조회 화면
router.get('/sellList', listController.getListFirst);

//글쓰기 전체 조회 화면 (idx 페이지)
router.get('/sellList/:page', listController.getList);

//카테고리별 조회
router.get('/sellList/category/:categoryNum', listController.getCategoryList);

//글쓰기 조회 화면
router.get('/sellRead/:Bno', readController.readData);

//글쓰기 화면
router.get('/sellWrite', function (req, res, next) {
    res.render('sellWrite', { title: '판매 글쓰기' });
})

//글쓰기 수정 화면
router.get('/sellUpdate', function (req, res, next) {
    res.render('sellUpdate', { title: '판매 글 수정하기' });
})

module.exports = router;