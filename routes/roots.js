var express = require('express');
var crypto = require('crypto'); // 암호화 및 복호화 수행
var router = express.Router();
const fs = require('fs');       // 파일 경로 얻기
var url = require('url');
var path = require('path');
const sharp = require('sharp'); // 이미지 크기 조정
const Chart = require('chart'); //차트 추가
const multer = require('multer');
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

var UpdateEnable = false;
const algorithm = 'aes-192-cbc';
const key = Buffer.from("123456789012345678901234", "utf8"); // 24바이트 키 (AES-192)
const iv = Buffer.from("1234567890123456", "utf8"); // 16바이트 IV

//공지사항 리스트 화면
router.get('/notificationList', function (req, res, next) {
  var { rootLogin, usrLogin, rootname, usrid } = require('./index');
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
  connection.query(sql1, (err, countResult) => {
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
      console.log('usrid', + usrid);
      // 렌더링할 데이터와 페이지네이션 정보를 클라이언트에 전달
      res.render('RootFunction/notificationList', {
        title: '공지사항',
        rows: rows,
        rootLogin,
        usrLogin,
        currentPage: page,
        totalPages: totalPages,
        sort: sort,
        order: order,
        rootname,
        usrid
      });
    });
  });
})

// 공지사항 게시물 화면
router.get('/notificationRead/:Bid', function (req, res, next) {
  // 조회수 증가
  var idx = req.params.Bid;
  var sql1 = "UPDATE ROOTBOARD SET Hit=Hit+1 WHERE Bid=?";
  connection.query(sql1, [idx], (err, rows, fields) => {
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
  var { rootLogin, usrLogin, rootname, rootid, usrid } = require('./index');
  var sql3 = "SELECT * FROM ROOT, ROOTBOARD WHERE Rid=Rnum AND Rid=? AND Bid=?;";
  connection.query(sql3, [rootid, idx], (err, results, fields) => {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    // 자신이 작성한 게시글만 수정가능
    if (results.length > 0) {
      UpdateEnable = true;
    }
    else {
      UpdateEnable = false;
    }
  });
  console.error("UpdateEnable: " + UpdateEnable);
  // 게시물 정보 가져오기
  var sql2 = "SELECT Bid, Rname, Title, Content, Updated, Hit FROM ROOTBOARD, ROOT WHERE Rid=Rnum AND Bid=?";
  connection.query(sql2, [idx], (err, rows, fields) => {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    console.log('rows: ' + JSON.stringify(rows));
    // 정보보내기
    res.render('RootFunction/notificationRead', { title: rows[0].Title, usrLogin, usrid, rootname, row: rows[0], UpdateEnable, rootLogin });
  });
})

router.post('/notificationDelete', function (req, res, next) { // 삭제수행
  var { rootid } = require('./index');
  var datas = [
    rootid,
    req.body.passwd,
    req.body.Bid
  ]
  console.log('datas : ' + datas)
  // 해당 게시물 삭제 쿼리
  var sql1 = "DELETE FROM A USING ROOTBOARD A JOIN ROOT B ON Rnum=Rid WHERE Rid=? AND Rpwd=? AND Bid=?";
  console.log('sql1 : ' + sql1)
  connection.query(sql1, datas, function (err, results) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    if (results.affectedRows == 0) {
      res.send("<script>alert('비밀번호가 틀렸습니다.');history.back();</script>");
    }
    else { // 삭제 성공 -> Bid 재정렬
      var sql2 = "ALTER TABLE ROOTBOARD AUTO_INCREMENT=1;";
      console.log('sql2 : ' + sql2)
      connection.query(sql2, function (err, results) {
        if (err) {
          console.error("err: " + err);
          return res.status(500).send("데이터베이스 오류");
        }
        var sql3 = "SET @COUNT = 0;";
        console.log('sql3 : ' + sql3)
        connection.query(sql3, function (err, results) {
          if (err) {
            console.error("err: " + err);
            return res.status(500).send("데이터베이스 오류");
          }
          var sql4 = "UPDATE ROOTBOARD SET Bid = @COUNT:=@COUNT+1;";
          console.log('sql4 : ' + sql4)
          connection.query(sql4, function (err) {
            if (err) {
              console.error("err: " + err);
              return res.status(500).send("데이터베이스 오류");
            }
            res.redirect('/roots/notificationList');
          });
        });
      });
    }
  });
});


// 공지사항 글쓰기 화면
router.get('/notificationWrite', function (req, res, next) {
  var { rootLogin, usrLogin, rootname, rootid } = require('./index');
  console.log("관리자 아이디 : " + rootid);
  res.render('RootFunction/notificationWrite', { title: '공지사항 작성하기', rootname,rootLogin, usrLogin, rootid });
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
  connection.query(sql, datas, function (err, rows) {
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
  var { rootLogin, usrLogin, rootname, rootid } = require('./index');
  var idx = req.query.Bid;
  console.log("관리자 아이디 : " + rootid);
  console.log("게시판 아이디 : " + idx);
  // 게시물 정보 가져오기
  var sql = "SELECT * FROM ROOTBOARD WHERE Rnum=? AND Bid=?";
  connection.query(sql, [rootid, idx], (err, rows, fields) => {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    if (rows.length === 0) { // 조회 결과가 없을 경우
      console.error("해당 게시물을 찾을 수 없습니다.");
      return res.status(404).send("해당 게시물을 찾을 수 없습니다.");
    }
    console.log('rows: ' + JSON.stringify(rows));
    // 정보보내기
    res.render('RootFunction/notificationUpdate', { title: '공지사항 수정하기', rootid, rootLogin, usrLogin, rootname, row: rows[0] });
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
  connection.query(sql, datas, function (err, results) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    if (results.affectedRows == 0) {
      res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 변경되지 않았습니다.');history.back();</script>");
    }
    else { // 수정 성공
      res.redirect('/roots/notificationRead/' + req.body.Bid);
    }
  });
});

// 회원 리스트 가져오기
router.get('/manageUsrList', function (req, res, next) {
  var { rootLogin, rootname } = require('./index');
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
  connection.query(sql1, (err, countResult) => {
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
      res.render('RootFunction/manageUsrList', {
        title: '회원관리',
        rows: rows,
        rootLogin,
        currentPage: page,
        totalPages: totalPages,
        sort: sort,
        order: order,
        rootname
      });
    });
  });
});

// 특정 회원 관리 화면
router.get('/manageUsrInfo/:Uno', function (req, res, next) {
  console.log('회원 번호 : ' + req.params.Uno);
  var { rootLogin, usrLogin, rootname } = require('./index');
  // 회원 정보 가져오기
  var sql = `SELECT * FROM PERSON, USR WHERE Pid=Uid AND Uno=?;`;

  connection.query(sql, [req.params.Uno], (err, rows, fields) => {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    if (rows.length === 0) { // 조회 결과가 없을 경우
      console.error("해당 게시물을 찾을 수 없습니다.");
      return res.status(404).send("해당 회원을 찾을 수 없습니다.");
    }
    console.log('rows: ' + JSON.stringify(rows));
    // 프로필 이미지 경로 확인, 이미지가 존재하지 않으면 기본 프로필로 변경
    const profileImgPath = path.join(__dirname, '../public', rows[0].ProfileImg);
    if (!fs.existsSync(profileImgPath)) {
      console.log('Profile image not found. Using default image.');
      rows[0].ProfileImg = '/images/profile/basic_profile.jpg';
    }
    // 암호 복호화
    var decrypt = crypto.createDecipheriv(algorithm, key, iv);
    var decryptResult = decrypt.update(rows[0].Pwd, 'hex', 'utf8') + decrypt.final('utf8');
    // 정보보내기
    res.render('RootFunction/manageUsrInfo', { 
      title: '회원 정보 관리', row: rows[0], decryptResult, rootname, usrLogin, rootLogin });
  });
});

var storage = multer.diskStorage({  //파일 저장 방식 설정
  destination: function (req, file, cb) {
    cb(null, "public/images/profile/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    cb(null, path.basename(file.originalname, ext) + ext);
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }  // 파일 크기 제한 (10MB)
});

router.post('/manageUsrUpdate', function (req, res, next) { // 회원 정보 수정
  // 파일 업로드 미들웨어
  upload.single("image")(req, res, function (err) {
    if (err) {
      console.error("파일 업로드 중 오류 발생: " + err);
      return res.status(500).send("파일 업로드 오류 발생");
    }
    // 업로드된 파일 정보 출력
    console.log("req.file:" + req.file);
    console.log("profile:" + req.body.ProfileImg);
    // 파일 경로 결정
    var image = req.body.ProfileImg || '/images/profile/basic_profile.jpg';
    if (req.file) {
      image = `/images/profile/${req.file.filename}`;  // 새로 업로드된 파일 경로
    }
    console.log('저장될 이미지', image);
    console.log('업로드된 이미지', req.body.ProfileImg);
    // 받아온 데이터를 쿼리할 데이터 배열로 구성
    var encrypt = crypto.createCipheriv(algorithm, key, iv);
    var encryptResult = encrypt.update(req.body.passwd, 'utf8', 'hex') + encrypt.final('hex');
    var datas = [
      req.body.lname, // 성
      req.body.fname, // 이름
      req.body.pid, // 아이디
      encryptResult,
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
    connection.query(sql1, datas, function (err, results) {
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
  connection.query(sql1, datas, function (err, results) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    res.redirect('/roots/manageUsrList');
  });
});

// 게시판 리스트 가져오기
router.get('/manageBoardList', function (req, res, next) {
  var { rootLogin, usrLogin, rootname } = require('./index');
  console.log("rootLogin:", rootLogin);
  // 페이지 번호를 쿼리에서 가져오기 (기본값은 1)
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // 한 페이지당 10명
  const offset = (page - 1) * limit; // OFFSET 계산
  // 정렬 방향 설정 (기본값은 내림차순)
  const sort = req.query.sort || 'DESC';
  const order = req.query.order || 'Bno';
  // 전체 유저 수를 계산하는 쿼리 (페이지네이션을 위한 totalUserCount)
  var sql1 = "SELECT COUNT(*) AS total FROM BOARD";
  // 회원 데이터 가져오기
  var sql2 = `SELECT Bno, Bid, Buyer, Title, Trade, Updated, 
            Hit, Pdate, Category, Price, TradePlace
            FROM BOARD 
            ORDER BY ${order} ${sort}
            LIMIT ? OFFSET ?;`;
  connection.query(sql1, (err, countResult) => {
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
      res.render('RootFunction/manageBoardList', {
        title: '게시판 관리',
        rows: rows,
        rootLogin,
        usrLogin,
        currentPage: page,
        totalPages: totalPages,
        sort: sort, 
        order: order,
        rootname
      });
    });
  });
});

// 특정 게시판 관리 화면
router.get('/manageBoardInfo/:Bno', function (req, res, next) {
  console.log('회원 번호 : ' + req.params.Bno);
  var { rootLogin, usrLogin, rootname } = require('./index');
  // 게시판 정보 가져오기
  var sql = `SELECT * FROM BOARD WHERE Bno=?;`;
  connection.query(sql, [req.params.Bno], (err, rows, fields) => {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류");
    }
    if (rows.length === 0) { // 조회 결과가 없을 경우
      console.error("해당 게시물을 찾을 수 없습니다.");
      return res.status(404).send("해당 회원을 찾을 수 없습니다.");
    }
    // 프로필 이미지 경로 확인, 이미지가 존재하지 않으면 기본 프로필로 변경
    const productImg = path.join(__dirname, '../public', rows[0].Img);
    if (!fs.existsSync(productImg)) {
      console.log('Product image not found. Using default image.');
      rows[0].Img = '/images/product/img_err.png';
    }
    console.log('rows: ' + JSON.stringify(rows));
    // 정보보내기
    res.render('RootFunction/manageBoardInfo', { title: '게시판 관리', row: rows[0], rootname, usrLogin, rootLogin });
  });
});

router.post('/manageBoardUpdate', function (req, res, next) { // 게시판 정보 수정
  // 파일 업로드 미들웨어
  upload.single("image")(req, res, function (err) {
    if (err) {
      console.error("파일 업로드 중 오류 발생: " + err);
      return res.status(500).send("파일 업로드 오류 발생");
    }
    // 업로드된 파일 정보 출력
    console.log("req.file:" + req.file);
    console.log("product image:" + req.body.Img);
    // 파일 경로 결정
    var image = req.body.Img || '/images/product/img_err.png';
    if (req.file) {
      image = `/images/product/${req.file.filename}`;  // 새로 업로드된 파일 경로
    }
    console.log('저장될 이미지', image);
    console.log('업로드된 이미지', req.body.Img);
    // 받아온 데이터를 쿼리할 데이터 배열로 구성
    var datas = [
      req.body.bid,     // 판매자
      req.body.buyer,   // 구매자
      req.body.title,   // 제목
      req.body.content, // 내용
      req.body.trade,   // 거래상태
      req.body.updated, // 게시날짜
      req.body.hit,     // 조회수
      req.body.pdate,   // 상품 구매 날짜
      req.body.category, // 상품 카테고리
      req.body.price,   // 상품 가격
      req.body.tradeplace, // 거래 장소
      image,            // 상품 이미지 경로
      req.body.Bno      // 게시판 번호
    ];
    console.log(datas);
    // SQL 쿼리 작성
    var sql1 = `UPDATE BOARD SET Bid = ?, Buyer = ?, Title = ?, Content = ?, Trade = ?, Updated = ?,
                Hit = ?, Pdate = ?, Category = ?, Price = ?, TradePlace = ?, Img = ?
                WHERE Bno = ?`;
    // 쿼리 실행
    connection.query(sql1, datas, function (err, results) {
      if (err) {
        console.error("쿼리 실행 오류: " + err);
        return res.status(500).send("데이터베이스 오류 발생");
      } else {
        res.redirect('/roots/manageBoardInfo/' + req.body.Bno);
      }
    });
  });
});

router.post('/manageBoardDelete', function (req, res, next) { // 게시판 삭제수행
  var datas = [
    req.body.Bno
  ]
  console.log(datas)
  var sql1 = "DELETE FROM BOARD WHERE Bno=?";
  connection.query(sql1, datas, function (err, results) {
    if (err) {
      console.error("err: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    else { // 삭제 성공 -> Bno 재정렬
      var sql2 = "ALTER TABLE BOARD AUTO_INCREMENT=1;";
      console.log('sql2 : ' + sql2)
      connection.query(sql2, function (err, results) {
        if (err) {
          console.error("err: " + err);
          return res.status(500).send("데이터베이스 오류");
        }
        var sql3 = "SET @COUNT = 0;";
        console.log('sql3 : ' + sql3)
        connection.query(sql3, function (err, results) {
          if (err) {
            console.error("err: " + err);
            return res.status(500).send("데이터베이스 오류");
          }
          var sql4 = "UPDATE BOARD SET Bno = @COUNT:=@COUNT+1;";
          console.log('sql4 : ' + sql4)
          connection.query(sql4, function (err) {
            if (err) {
              console.error("err: " + err);
              return res.status(500).send("데이터베이스 오류");
            }
            res.redirect('/roots/manageBoardList');
          });
        });
      });
    }
  });
});

//사이트 분석 화면 npm install chart
router.get('/manageAnalytics', function (req, res, next) {
  var { rootLogin, usrLogin, rootname } = require('./index');
  // 성별 집계
  var sql1 = `SELECT COUNT(*) AS COUNT
              FROM PERSON
              GROUP BY Sex;`;
  // 신뢰도 집계
  var sql2 = `SELECT Uid, Trust
              FROM USR
              ORDER BY Trust DESC LIMIT 7;`;
  // 돈 집계
  var sql3 = `SELECT Uid, Money
              FROM USR
              ORDER BY Money DESC LIMIT 7;`;
  // 연령대 집계
  var sql4 = `SELECT
              COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, Bdate, CURDATE()) BETWEEN 0 AND 9 THEN 1 END) AS count0,
              COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, Bdate, CURDATE()) BETWEEN 10 AND 19 THEN 1 END) AS count1,
              COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, Bdate, CURDATE()) BETWEEN 20 AND 29 THEN 1 END) AS count2,
              COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, Bdate, CURDATE()) BETWEEN 30 AND 39 THEN 1 END) AS count3,
              COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, Bdate, CURDATE()) BETWEEN 40 AND 49 THEN 1 END) AS count4,
              COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, Bdate, CURDATE()) >= 50 THEN 1 END) AS count5 
              FROM PERSON;`;
  // 월별 회원가입 집계 (최근 3년)
  var sql5 = `SELECT YEAR(Login) AS year, MONTH(Login) as month, COUNT(Pid) AS login_count
              FROM PERSON GROUP BY YEAR(Login), MONTH(Login)
              ORDER BY year, month LIMIT 36`;
  // 카테고리 집계
  var sql6 = `SELECT Category, COUNT(*) AS count
              FROM BOARD GROUP BY Category; `;
  
  // 쿼리 실행
  connection.query(sql1, function (err, gender) {
    if (err) {
      console.error("쿼리 실행 오류: " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    let genderData = {
      maleCount: gender[0].COUNT,
      femaleCount: gender[1].COUNT
    };
    connection.query(sql2, function (err, usrtrust) {
      if (err) {
        console.error("쿼리 실행 오류: " + err);
        return res.status(500).send("데이터베이스 오류 발생");
      }
      let trustData = {
        // trust
        top1: usrtrust[0].Trust,
        top2: usrtrust[1].Trust,
        top3: usrtrust[2].Trust,
        top4: usrtrust[3].Trust,
        top5: usrtrust[4].Trust,
        top6: usrtrust[5].Trust,
        top7: usrtrust[6].Trust,
        // user id
        ntop1: usrtrust[0].Uid,
        ntop2: usrtrust[1].Uid,
        ntop3: usrtrust[2].Uid,
        ntop4: usrtrust[3].Uid,
        ntop5: usrtrust[4].Uid,
        ntop6: usrtrust[5].Uid,
        ntop7: usrtrust[6].Uid
      };
      connection.query(sql3, function (err, usrmoney) {
        if (err) {
          console.error("쿼리 실행 오류: " + err);
          return res.status(500).send("데이터베이스 오류 발생");
        } 
        let moneyData = {
          // trust
          top1: usrmoney[0].Money,
          top2: usrmoney[1].Money,
          top3: usrmoney[2].Money,
          top4: usrmoney[3].Money,
          top5: usrmoney[4].Money,
          top6: usrmoney[5].Money,
          top7: usrmoney[6].Money,
          // user id
          ntop1: usrmoney[0].Uid,
          ntop2: usrmoney[1].Uid,
          ntop3: usrmoney[2].Uid,
          ntop4: usrmoney[3].Uid,
          ntop5: usrmoney[4].Uid,
          ntop6: usrmoney[5].Uid,
          ntop7: usrmoney[6].Uid,
        };
        connection.query(sql4, function (err, usrage) {
          if (err) {
            console.error("쿼리 실행 오류: " + err);
            return res.status(500).send("데이터베이스 오류 발생");
          }
          let maxcount = Math.max(usrage[0].count0, usrage[0].count1, usrage[0].count2,
                      usrage[0].count3, usrage[0].count4, usrage[0].count5);
          let ageData = {
            age0: usrage[0].count0,
            age1: usrage[0].count1,
            age2: usrage[0].count2,
            age3: usrage[0].count3,
            age4: usrage[0].count4,
            age5: usrage[0].count5,
            maxcount: maxcount
          };
          connection.query(sql5, function(err, login) {
            if (err) {
              console.error("쿼리 실행 오류: " + err);
              return res.status(500).send("데이터베이스 오류 발생");
            }
            const loginData = JSON.stringify(login);
            connection.query(sql6, function (err, category) {
              if (err) {
                console.error("쿼리 실행 오류: " + err);
                return res.status(500).send("데이터베이스 오류 발생");
              }
              const categoryData = JSON.stringify(category);
              // 데이터 보기
              console.log(genderData);
              console.log(trustData);
              console.log(moneyData);
              console.log(ageData);
              console.log(loginData);
              console.log(categoryData);
              // 데이터 보내기
              res.render('RootFunction/manageAnalytics',{ 
              title: '사이트 분석', 
              genderData:genderData, trustData:trustData, moneyData:moneyData, 
              ageData:ageData, loginData:loginData, categoryData:categoryData,
              rootname, rootLogin, usrLogin });
            });
          });
        });
      });
    });
  });
})


module.exports = router;