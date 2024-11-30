var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

var rootLogin = false;
var rootid = "";
var usrLogin = false;
var usrid = "";

//시작 화면
router.get('/', function (req, res, next) {
  var sql = 'SELECT Bno, Img, Title, Price, Trade FROM board ORDER BY Bno DESC LIMIT 8 OFFSET 0'; //최신 게시글 8개

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.log(rows);
    res.render('index', { title: '중고장터', rows: rows, rootLogin, usrLogin });
  });
});

//회원가입 화면
router.get('/joinForm', function (req, res, next) {
  res.render('LoginFunction/joinForm', { title: '회원가입', rootLogin, usrLogin });
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
  connection.query(sql1, Pdatas, function (err, rows) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    console.log("rows: " + JSON.stringify(rows));
  });
  var sql2 = "INSERT INTO USR(Uid, Pwd, Nickname) VALUES(?,?,?);";
  connection.query(sql2, Udatas, function (err, rows) {
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
  res.render('LoginFunction/login', { title: '로그인', rootLogin, usrLogin });
})

router.post('/login', function (req, res, next) { // 유저 로그인 입력
  var Udatas = [
    req.body.id,
    req.body.passwd,
  ];

  var sql = "SELECT * FROM USR WHERE Uid=? AND Pwd=?;";
  connection.query(sql, Udatas, function (err, results, fields) {
    if (err) throw err;
    if (results.length > 0) { // db 반환값이 존재할 때
      usrLogin = true;
      usrid = req.body.id;
      module.exports.usrid = usrid;
      module.exports.usrLogin = usrLogin;
      console.log("이용자 아이디 : " + usrid);
      res.redirect('/'); // 회원가입 후 리다이렉트
    }
    else {
      console.error("err: " + err);
      return res.status(500).send("등록되지 않은 유저입니다.");
    }
  });
});

// 관리자 로그인 화면
router.get('/rootLogin', function (req, res, next) {
  res.render('LoginFunction/rootLogin', { title: '관리자 로그인', rootLogin, usrLogin });
})

router.post('/rootLogin', function (req, res, next) { // 관리자 로그인 입력
  var Rdatas = [
    req.body.id,
    req.body.passwd,
  ];

  var sql = "SELECT * FROM ROOT WHERE Rid=? AND Rpwd=?;";
  connection.query(sql, Rdatas, function (err, results, fields) {
    if (err) throw err;
    if (results.length > 0) { // db 반환값이 존재할 때
      rootLogin = true;
      rootid = req.body.id;
      module.exports.rootid = rootid;
      module.exports.rootLogin = rootLogin;
      console.log("관리자 아이디 : " + rootid);
      res.redirect('/'); // 회원가입 후 리다이렉트
    }
    else {
      console.error("err: " + err);
      return res.status(500).send("등록되지 않은 관리자입니다.");
    }
  });
});

// 유저/관리자 로그아웃
router.get('/logout', function (req, res, next) {
  rootLogin = false;
  usrLogin = false;
  usrid = "";
  rootid = "";
  module.exports.rootid = rootid;
  module.exports.rootLogin = rootLogin;
  module.exports.usrid = usrid;
  module.exports.usrLogin = usrLogin;
  res.redirect('/');
})

//아이디 찾기 화면
router.get('/findId', function (req, res, next) {
  res.render('LoginFunction/findId', { title: '아이디 찾기' });
})

//비밀번호 찾기 화면
router.get('/findPasswd', function (req, res, next) {
  res.render('LoginFunction/findPasswd', { title: '비밀번호 찾기' });
})

//찜 버튼 눌렀을 때
router.post('/addWish', function (req, res, next){
  var Bno = req.body.idx;
  var likeCount = req.body.like;
  var datas = [usrid, Bno]; //사용자 아이디, 게시판 번호

  if (likeCount == 0){ //찜을 하지 않은 경우
    var insertSql = "INSERT INTO WISHLIST(Uid, Bnum) VALUES(?, ?);"; //wishlist table에 삽입
    connection.query(insertSql, datas, function (err, rows) {
      if (err) console.error("err : " + err);
      res.redirect('/sellBoard/sellRead/' + String(Bno)); //기존에 보고 있던 게시글로 redirect
    })
  }
  else{ //찜을 한 경우
    var deleteSql = "DELETE FROM WISHLIST WHERE Uid=? and Bnum=?"; //wishlist table에서 삭제
    connection.query(deleteSql, datas, function (err, rows) {
      if (err) console.error("err : " + err);
      res.redirect('/sellBoard/sellRead/' + String(Bno)); //기존에 보고 있던 게시글로 redirect
    })
  }
})

//메세지 화면
router.get('/message', function (req, res, next) {
  res.render('message', { title: '메세지', rootLogin, usrLogin });
})

module.exports = router;
