var express = require('express');
var router = express.Router();


//시작 화면
router.get('/', function (req, res, next) {
  res.render('index', { title: '중고장터' });
});

//회원가입 화면
router.get('/joinForm', function (req, res, next) {
  res.render('joinForm', { title: '회원가입' });
})

//로그인 화면
router.get('/login', function (req, res, next) {
  res.render('login', { title: '로그인' });
})

//비밀번호 찾기 화면
router.get('/findPasswd', function (req, res, next) {
  res.render('findPasswd', { title: '비밀번호 찾기' });
})

//마이페이지 화면
router.get('/myPage', function (req, res, next) {
  res.render('myPage', { title: '마이페이지' });
})

//메세지 화면
router.get('/message', function (req, res, next) {
  res.render('message', { title: '메세지' });
})

router.get('/test', function (req, res, next) {
  res.render('test', { title: '테스트' });
})

module.exports = router;
