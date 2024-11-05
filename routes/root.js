var express = require('express');
var router = express.Router();

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

module.exports = router;