var express = require('express');
var router = express.Router();
var url = require('url');
var path = require('path');
const multer = require('multer');
var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tutorial'
});

var UpdateEnable = false;

//공지사항 리스트 화면
router.get('/notificationList', function (req, res, next) {
  var { rootLogin } = require('./index'); 
  console.log("rootLogin:", rootLogin);
  // 페이지 번호를 쿼리에서 가져오기 (기본값은 1)
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // 한 페이지당 10개
  const offset = (page - 1) * limit; // OFFSET 계산
  // 정렬 방향 설정 (기본값은 내림차순)
  const sort = req.query.sort || 'DESC'; 
  const order = req.query.order || 'Bid'; 
  // 전체 공지사항을 계산하는 쿼리 (페이지네이션을 위한 totalUserCount)
  var sql1 = "SELECT COUNT(*) AS total FROM ROOTBOARD;";
  // 게시글 데이터 가져오기
  var sql2 = `SELECT Bid, Rname, Title, Updated, Hit 
              FROM ROOTBOARD, ROOT WHERE Rid=Rnum 
              ORDER BY ${order} ${sort}
              LIMIT ? OFFSET ?;`;
  connection.query(sql1, (err, countResult)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit); // 전체 페이지 수 계산
    // 회원 데이터 가져오기
    connection.query(sql2, [limit, offset], (err, rows) => {
      if (err) {
        console.error("err: " + err);
        return res.status(500).send("데이터베이스 오류");
      }
      console.log('rows: ' + JSON.stringify(rows));

      // 렌더링할 데이터와 페이지네이션 정보를 클라이언트에 전달
      res.render('notificationList', {
        title: '공지사항',
        rows: rows,
        rootLogin,
        currentPage: page,
        totalPages: totalPages,
        sort: sort, 
        order: order 
      });
    });
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
    if (rows.length === 0) { // 조회 결과가 없을 경우
      console.error("해당 게시물을 찾을 수 없습니다.");
      return res.status(404).send("해당 게시물을 찾을 수 없습니다.");
    }
  });
  // 게시물 수정 권한
  var { rootid } = require('./index'); 
  var { rootLogin } = require('./index');
  var sql3 = "SELECT * FROM ROOT, ROOTBOARD WHERE Rid=Rnum AND Rid=? AND Bid=?;";
  connection.query(sql3, [rootid, idx], (err, results, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    // 자신이 작성한 게시글만 수정가능
    if (results.length > 0)
    {
      UpdateEnable = true;
    }
    else
    {
      UpdateEnable = false;
    }
  });
  console.error("UpdateEnable: " + UpdateEnable);
  // 게시물 정보 가져오기
  var sql2 = "SELECT Bid, Rname, Title, Content, Updated, Hit FROM ROOTBOARD, ROOT WHERE Rid=Rnum AND Bid=?";
  connection.query(sql2, [idx], (err, rows, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    console.log('rows: '+JSON.stringify(rows));
    // 정보보내기
    res.render('notificationRead', { title: rows[0].Title, row: rows[0], UpdateEnable, rootLogin});
  });
})

router.post('/notificationDelete', function (req, res, next) { // 삭제수행
  var { rootid } = require('./index');
  var datas = [
    rootid,
    req.body.passwd,
    req.body.Bid
  ]
  // 해당 게시물 삭제 쿼리
  var sql1 = "DELETE FROM A USING ROOTBOARD A JOIN ROOT B ON Rnum=Rid WHERE Rid=? AND Rpwd=? AND Bid=?";
  connection.query(sql1, datas, function(err, results) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    if (results.affectedRows == 0) {
      res.send("<script>alert('비밀번호가 틀렸습니다.');history.back();</script>");
    } 
    else { // 삭제 성공 -> Bid 재정렬
      var sql2 = "ALTER TABLE ROOTBOARD AUTO_INCREMENT=1;";
      connection.query(sql2, function(err, results) {
        if (err) {
          console.error("err: " + err);
          return res.status(500).send("데이터베이스 오류");
        }
      });
      var sql3 = "SET @COUNT = 0;";
      connection.query(sql3, function(err, results) {
        if (err) {
          console.error("err: " + err);
          return res.status(500).send("데이터베이스 오류");
        }
      });
      var sql4 = "UPDATE ROOTBOARD SET Bid = @COUNT:=@COUNT+1;";
      connection.query(sql4, function(err, results) {
        if (err) {
          console.error("err: " + err);
          return res.status(500).send("데이터베이스 오류");
        }
      });
      res.redirect('/roots/notificationList');
    }
  });
});


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

// 공지사항 글수정 화면
router.get('/notificationUpdate', function (req, res, next) {
  var { rootid } = require('./index');
  var idx = req.query.Bid;
  console.log("관리자 아이디 : " + rootid);
  console.log("게시판 아이디 : " + idx);
  // 게시물 정보 가져오기
  var sql = "SELECT * FROM ROOTBOARD WHERE Rnum=? AND Bid=?";
  connection.query(sql, [rootid, idx], (err, rows, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    if (rows.length === 0) { // 조회 결과가 없을 경우
      console.error("해당 게시물을 찾을 수 없습니다.");
      return res.status(404).send("해당 게시물을 찾을 수 없습니다.");
    }
    console.log('rows: '+JSON.stringify(rows));
    // 정보보내기
    res.render('notificationUpdate', { title: '공지사항 수정하기', row: rows[0] });
  });
})

router.post('/notificationUpdate', function (req, res, next) { // 공지사항 글수정
  var { rootid } = require('./index'); 
  console.log("관리자 아이디 : " + rootid);
  console.log(req.body);
  var title = String(req.body.title);
  var content = String(req.body.content);
  var passwd = String(req.body.passwd);
  var datas = [
    title,
    content,
    rootid,
    req.body.Bid,
    passwd
  ];
  
  var sql = "UPDATE ROOTBOARD, ROOT SET Title=?, Content=? WHERE Rnum=Rid AND Rid=? AND Bid=? AND Rpwd=?";
  connection.query(sql, datas, function(err, results) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    if (results.affectedRows == 0){
      res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 변경되지 않았습니다.');history.back();</script>");
    }
    else
    { // 수정 성공
      res.redirect('/roots/notificationRead/'+req.body.Bid); 
    }
  });
});

// 회원 리스트 가져오기
router.get('/manageUsrList', function (req, res, next) {
  var { rootLogin } = require('./index'); 
  console.log("rootLogin:", rootLogin);
  // 페이지 번호를 쿼리에서 가져오기 (기본값은 1)
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // 한 페이지당 10명
  const offset = (page - 1) * limit; // OFFSET 계산
  // 정렬 방향 설정 (기본값은 내림차순)
  const sort = req.query.sort || 'DESC'; 
  const order = req.query.order || 'Uno'; 
  // 전체 유저 수를 계산하는 쿼리 (페이지네이션을 위한 totalUserCount)
  var sql1 = "SELECT COUNT(*) AS total FROM PERSON, USR WHERE Pid=Uid";
  // 회원 데이터 가져오기
  var sql2 = `SELECT Uno, CONCAT(Lname, ' ', Fname) AS Name, 
            Sex, Pid, Nickname, Money, Trust, Bcnt, Bdate, Login, Email 
            FROM PERSON, USR WHERE Pid=Uid 
            ORDER BY ${order} ${sort}
            LIMIT ? OFFSET ?;`;
  connection.query(sql1, (err, countResult)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit); // 전체 페이지 수 계산
    // 회원 데이터 가져오기
    connection.query(sql2, [limit, offset], (err, rows) => {
      if (err) {
        console.error("err: " + err);
        return res.status(500).send("데이터베이스 오류");
      }
      console.log('rows: ' + JSON.stringify(rows));

      // 렌더링할 데이터와 페이지네이션 정보를 클라이언트에 전달
      res.render('manageUsrList', {
        title: '회원관리',
        rows: rows,
        rootLogin,
        currentPage: page,
        totalPages: totalPages,
        sort: sort, 
        order: order 
      });
    });
  });
});

// 특정 회원 관리 화면 
router.get('/manageUsrInfo/:Uno', function (req, res, next) {
  console.log('회원 번호 : '+req.params.Uno);
  // 회원 정보 가져오기
  var sql = `SELECT * FROM PERSON, USR WHERE Pid=Uid AND Uno=?;`;
  connection.query(sql, [req.params.Uno], (err, rows, fields)=>{
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    if (rows.length === 0) { // 조회 결과가 없을 경우
      console.error("해당 게시물을 찾을 수 없습니다.");
      return res.status(404).send("해당 회원을 찾을 수 없습니다.");
    }
    console.log('rows: '+JSON.stringify(rows));
    // 정보보내기
    res.render('manageUsrInfo', { title: '회원 정보 관리', row: rows[0] });
  });
});

var storage = multer.diskStorage({  //파일 저장 방식 설정
  destination: function (req, file, cb) {
      cb(null, "public/images/profile/");
  },
  filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
  },
});

var upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }  // 파일 크기 제한 (10MB)
});

router.post('/manageUsrUpdate', function (req, res, next) { // 회원 정보 수정
  // 파일 업로드 미들웨어
  upload.single("image")(req, res, function(err) {
    if (err) {
      console.error("파일 업로드 중 오류 발생: " + err);
      return res.status(500).send("파일 업로드 오류 발생");
    }
    // 업로드된 파일 정보 출력
    console.log("req.file:"+ req.file);
    console.log("profile:"+ req.body.ProfileImg);
    // 파일 경로 결정
    var image = req.body.ProfileImg || '/images/profile/basic_profile.jpg';
    if (req.file) {
      image = `/images/profile/${req.file.filename}`;  // 새로 업로드된 파일 경로
    }
    console.log('저장될 이미지', image);
    console.log('업로드된 이미지', req.body.ProfileImg);
    // 받아온 데이터를 쿼리할 데이터 배열로 구성
    var datas = [
      req.body.lname, // 성
      req.body.fname, // 이름
      req.body.pid, // 아이디
      req.body.passwd, // 비밀번호
      req.body.nickname, // 닉네임
      req.body.sex, // 성별
      req.body.bdate, // 생일
      req.body.email, // 이메일
      req.body.money, // 포인트
      req.body.trust, // 신뢰도
      req.body.state, // 소개문구
      image, // 프로필 이미지 경로
      req.body.Uno // 회원 번호
    ];
    console.log(datas);
    // SQL 쿼리 작성
    var sql1 = `UPDATE PERSON, USR SET Lname = ?, Fname = ?, Pid = ?, Pwd = ?, Nickname = ?, 
                Sex = ?, Bdate = ?, Email = ?, Money = ?, Trust = ?, State = ?, ProfileImg = ?
                WHERE Pid=Uid AND Uno = ?`;
    // 쿼리 실행
    connection.query(sql1, datas, function(err, results) {
      if (err) {
        console.error("쿼리 실행 오류: " + err);
        return res.status(500).send("데이터베이스 오류 발생");
      } else {
        res.redirect('/roots/manageUsrInfo/' + req.body.Uno);
      }
    });
  });
});

router.post('/manageUsrDelete', function (req, res, next) { // 회원 삭제수행
  var datas = [
    req.body.Uno
  ]
  var sql1 = "DELETE FROM PERSON USING PERSON JOIN USR ON Pid=Uid WHERE Uno=?";
  connection.query(sql1, datas, function(err, results) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    } 
    res.redirect('/roots/manageUsrList');
  });
});

module.exports = router;