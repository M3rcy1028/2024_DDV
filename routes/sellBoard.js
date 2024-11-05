var express = require('express');
var router = express.Router();

//글쓰기 조회 화면
router.get('/sellList', function (req, res, next) {
    res.render('sellList', { title: '판매 글보기' });
})

//글쓰기 조회 화면
router.get('/sellRead', function (req, res, next) {
    res.render('sellRead', { title: '판매 글보기' });
})

//글쓰기 화면
router.get('/sellWrite', function (req, res, next) {
    res.render('sellWrite', { title: '판매 글쓰기' });
})

//글쓰기 수정 화면
router.get('/sellUpdate', function (req, res, next) {
    res.render('sellUpdate', { title: '판매 글 수정하기' });
})

module.exports = router;