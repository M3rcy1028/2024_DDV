var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  connectionLimit: 5,
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'tutorial'
});

//시작 화면
router.get('/', function (req, res, next) {
  var sql = 'SELECT Bno, Img, Title, Price, Trade FROM board ORDER BY Bno DESC LIMIT 8 OFFSET 0'; //최신 게시글 8개

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.log(rows);
    res.render('index', { title: '중고장터', rows: rows });
  });
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

module.exports = router;
