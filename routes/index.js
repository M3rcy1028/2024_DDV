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
  res.render('index', { title: '중고장터' });
});

//회원가입 화면
router.post('/joinForm', function (req, res, next) {
  var Pdatas = [
    req.body.id,
    req.body.Lname,
    req.body.Fname,
    req.body.Bdate,
    req.body.sex,
    req.body.email
  ];

  var Udatas = [
    req.body.id,
    req.body.passwd,
    req.body.nickname,
  ];

  var sql1 = "INSERT INTO PERSON(Pid, Lname, Fname, Bdate, Sex, Email) VALUES(?,?,?,?,?,?);";
  connection.query(sql1, Pdatas, function(err, rows) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    console.log("rows: " + JSON.stringify(rows));
  });
  var sql2 = "INSERT INTO USR(Uid, Pwd, Nickname) VALUES(?,?,?);";
  connection.query(sql2, Udatas, function(err, rows) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    console.log("rows: " + JSON.stringify(rows));
  });
  res.redirect('/login'); // 회원가입 후 리다이렉트
});

router.get('/joinForm', function (req, res, next) {
  res.render('joinForm', { title: '회원가입' });
})

//관리자 로그인 화면
router.get('/rootLogin', function (req, res, next) {
  res.render('rootLogin', { title: '관리자 로그인' });
})

//로그인 화면
router.get('/login', function (req, res, next) {
  res.render('login', { title: '로그인' });
})

//아이디 찾기 화면
router.get('/findId', function (req, res, next) {
  res.render('findId', { title: '아이디 찾기' });
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
