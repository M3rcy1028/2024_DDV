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

//공지사항 리스트 화면
router.get('/notificationList', function (req, res, next) {
  var { rootLogin } = require('./index'); 
  console.log("rootLogin:", rootLogin);
  var sql = "SELECT Bid, Rname, Title, Updated, Hit FROM ROOTBOARD, ROOT WHERE Rid=Rnum ORDER BY Bid DESC;";
  connection.query(sql, (err, rows, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    console.log('rows: '+JSON.stringify(rows));
    res.render('notificationList', { title: '공지사항', rows: rows, rootLogin});
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

// 공지사항 글쓰기 화면
router.get('/notificationWrite', function (req, res, next) {
  var { rootid } = require('./index'); 
  console.log("관리자 아이디 : " + rootid);
  res.render('notificationWrite', { title: '공지사항 작성하기', rootid });
})

router.post('/notificationWrite', function (req, res, next) { // 공지사항 글쓰기
  var { rootid } = require('./index'); 
  console.log("관리자 아이디 : " + rootid);
  console.log(req.body);
  var datas = [
    rootid,
    req.body.title,
    req.body.content
  ];
  
  var sql = "INSERT INTO ROOTBOARD(Rnum, Title, Content) VALUES(?,?,?);";
  connection.query(sql, datas, function(err, rows) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    console.log("rows: " + JSON.stringify(rows));
  });
  res.redirect('/roots/notificationList'); 
});

module.exports = router;