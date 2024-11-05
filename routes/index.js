var express = require('express');
var router = express.Router();
var session = require('express-session');  // 로그인 수행
var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tutorial'
});

var rootLogin = false;
var usrLogin = false;

//시작 화면
router.get('/', function (req, res, next) {
  res.render('index', { title: '중고장터', rootLogin, usrLogin });
});

//회원가입 화면
router.get('/joinForm', function (req, res, next) {
  res.render('joinForm', { title: '회원가입', rootLogin, usrLogin });
})

router.post('/joinForm', function (req, res, next) { // 회원가입 정보 받기
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

// 유저 로그인 화면
router.get('/login', function (req, res, next) {
  res.render('login', { title: '로그인', rootLogin, usrLogin });
})

router.post('/login', function (req, res, next) { // 유저 로그인 입력
  var Udatas = [
    req.body.id,
    req.body.passwd,
  ];
  
  var sql = "SELECT * FROM USR WHERE Uid=? AND Pwd=?;";
  connection.query(sql, Udatas, function(err, results, fields) {
    if (err) throw err;
    if (results.length > 0) { // db 반환값이 존재할 때
      usrLogin = true;
      res.redirect('/'); // 회원가입 후 리다이렉트
    }
    else
    {
      console.error("err: " + err);
      return res.status(500).send("등록되지 않은 유저입니다.");
    }
  });
});

// 관리자 로그인 화면
router.get('/rootLogin', function (req, res, next) {
  res.render('rootLogin', { title: '관리자 로그인', rootLogin, usrLogin });
})

router.post('/rootLogin', function (req, res, next) { // 관리자 로그인 입력
  var Rdatas = [
    req.body.id,
    req.body.passwd,
  ];
  
  var sql = "SELECT * FROM ROOT WHERE Rid=? AND Rpwd=?;";
  connection.query(sql, Rdatas, function(err, results, fields) {
    if (err) throw err;
    if (results.length > 0) { // db 반환값이 존재할 때
      rootLogin = true;
      res.redirect('/'); // 회원가입 후 리다이렉트
    }
    else
    {
      console.error("err: " + err);
      return res.status(500).send("등록되지 않은 관리자입니다.");
    }
  });
});

// 유저/관리자 로그아웃
router.get('/logout', function (req, res, next) {
  rootLogin = false;
  usrLogin = false;
  res.redirect('/');
})

//공지사항 리스트 화면
router.get('/notification', function (req, res, next) {
  var sql = "SELECT Bid, Rname, Title, Updated, Hit FROM ROOTBOARD, ROOT WHERE Rid=Rnum ORDER BY Bid DESC;";
  connection.query(sql, (err, rows, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    console.log('rows: '+JSON.stringify(rows));
    res.render('notification', { title: '공지사항', rows: rows});
  });
})

// 공지사항 게시물 화면
router.get('/notificationRead/:Bid', function (req, res, next) {
  // 조회수 증가
  var idx = req.params.Bid;
  var sql1 = "UPDATE ROOTBOARD SET Hit=Hit+1 WHERE Bid=?";
  connection.query(sql1, [idx], (err, rows, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
  });
  // 게시물 정보 가져오기
  var sql2 = "SELECT Rname, Title, Content, Updated, Hit FROM ROOTBOARD, ROOT WHERE Bid=?";
  connection.query(sql2, [idx], (err, rows, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    console.log('rows: '+JSON.stringify(rows));
    res.render('notificationRead', { title: rows[0].Title, row: rows[0]});
  });
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
  res.render('myPage', { title: '마이페이지', rootLogin, usrLogin });
})

//메세지 화면
router.get('/message', function (req, res, next) {
  res.render('message', { title: '메세지', rootLogin, usrLogin });
})

module.exports = router;
