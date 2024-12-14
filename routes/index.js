var express = require('express');
var crypto = require('crypto'); // npm install -d crypto
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
var rootname = "";
var usrLogin = false;
var usrid = "";
// var usrname = "";

const algorithm = 'aes-192-cbc'
const key = Buffer.from("123456789012345678901234", "utf8"); // 24바이트 키 (AES-192)
const iv = Buffer.from("1234567890123456", "utf8"); // 16바이트 IV

//시작 화면
router.get('/', function (req, res, next) {
  var sql1 = `SELECT Bno, Img, Title, Price, Trade 
             FROM board 
             ORDER BY Bno DESC 
             LIMIT 8 OFFSET 0`; //최신 게시글 8개
  var sql2 = `SELECT Bno, Img, Title, Price, Trade 
             FROM board WHERE Trade='거래가능'
             ORDER BY Hit DESC LIMIT 4`;
  var sql3 = `SELECT Bno, Img, Title, Price, Trade
              FROM WISHLIST AS W, BOARD AS B WHERE uid=? and W.Bnum = B.Bno 
              ORDER BY Wno DESC LIMIT 40`;
  connection.query(sql1, (err, rows) => {
    if (err) throw err;
    console.log(rows);
    connection.query(sql2, (err, top) => {
      if (err) throw err;
      console.log(top);
      connection.query(sql3, [usrid], (err, list) => {
        if (err) throw err;
        console.log(list);
        res.render('index', {
          title: '중고장터', rows: rows, top: top, list: list,
          usrid, rootLogin, usrLogin, rootname
        });
      });
    });
  });
});

//시작 화면
router.get('/topBoard', function (req, res, next) {
  var sql = `SELECT Bno, Img, Title, Price, Trade 
             FROM board 
             ORDER BY Bno DESC 
             LIMIT 8 OFFSET 0`; //최신 게시글 8개

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.log(rows);
    res.render('index', { title: '중고장터', rows: rows, usrid, rootLogin, usrLogin, rootname });
  });
});

//회원가입 화면
router.get('/joinForm', function (req, res, next) {
  res.render('LoginFunction/joinForm', { title: '회원가입', rootLogin, usrLogin });
})

router.get('/checkId', function (req, res) { // 아이디 중복 확인
  const { id } = req.query;
  console.log("Check duplicated id : " + id);
  if (!id) {
    return;
  }
  const sql1 = `SELECT COUNT(*) AS pid_check
                FROM PERSON WHERE Pid=?`;
  connection.query(sql1, id, function (err, results) {
    if (err) {
      console.error("err : " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    const isDuplicate = results[0].pid_check > 0;
    res.json({ duplicate: isDuplicate });
  });
});

router.post('/joinForm', function (req, res, next) { // 회원가입 정보 받기
  var encrypt = crypto.createCipheriv(algorithm, key, iv);
  var encryptResult = encrypt.update(req.body.passwd, 'utf8', 'hex') + encrypt.final('hex');

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
    encryptResult,
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
  var encrypt = crypto.createCipheriv(algorithm, key, iv);
  var encryptResult = encrypt.update(req.body.passwd, 'utf8', 'hex') + encrypt.final('hex');

  var Udatas = [
    req.body.id,
    encryptResult,
  ];

  var sql1 = "SELECT * FROM USR WHERE Uid=? AND Pwd=?;";
  connection.query(sql1, Udatas, function (err, results, fields) {
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
  var sql1 = "SELECT * FROM ROOT WHERE Rid=? AND Rpwd=?;";
  var sql2 = "SELECT Rname FROM ROOT WHERE Rid=?;";
  connection.query(sql1, Rdatas, function (err, results, fields) {
    if (err) throw err;
    if (results.length > 0) { // db 반환값이 존재할 때
      rootLogin = true;
      rootid = req.body.id;
      module.exports.rootid = rootid;
      module.exports.rootLogin = rootLogin;
      connection.query(sql2, rootid, function (err, res2) {
        if (err) throw (err);
        rootname = res2[0].Rname;
        module.exports.rootname = rootname;
      })
      console.log("관리자 아이디 : " + rootid + "(" + rootname + ")");
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
  rootname = "";
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

router.get('/getid', function (req, res) { // 아이디 찾기
  const { lname, fname, email } = req.query;
  console.log("Check: " + lname + " " + fname + " " + email);
  if (!lname || !fname || !email) {
    return;
  }
  const sql1 = `SELECT Pid
            FROM PERSON WHERE Lname=? AND Fname=? AND Email=?`;
  connection.query(sql1, [lname, fname, email], function (err, results) {
    if (err) {
      console.error("err : " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    const Pid = results.length > 0 ? results[0].Pid : null;
    console.log("Find id : " + Pid)
    res.json({ Pid: Pid });
  });
});

//비밀번호 찾기 화면
router.get('/findPasswd', function (req, res, next) {
  res.render('LoginFunction/findPasswd', { title: '비밀번호 찾기' });
})

router.get('/getpwd', function (req, res) { // 비밀번호 찾기
  const { id, email } = req.query;
  console.log("Check: " + id + " " + email);
  if (!id || !email) {
    return;
  }
  const sql1 = `SELECT Pwd FROM USR, PERSON 
                WHERE Pid=Uid AND Uid=? AND Email=?`;
  const sql2 = `UPDATE USR SET Pwd = ? WHERE Uid=?`;
  connection.query(sql1, [id, email], function (err, results) {
    if (err) {
      console.error("err : " + err);
      return res.status(500).send("데이터베이스 오류 발생");
    }
    const Pwd = crypto.randomBytes(5).toString('hex');
    console.log("New pwd : " + Pwd);
    // 암호화
    var encrypt = crypto.createCipheriv(algorithm, key, iv);
    var encryptResult = encrypt.update(Pwd, 'utf8', 'hex') + encrypt.final('hex');
    connection.query(sql2, [encryptResult, id, email], function (err, results2) {
      if (err) {
        console.error("err : " + err);
        return res.status(500).send("데이터베이스 오류 발생");
      }
      res.json({ Pwd: Pwd });
    })
  });
});

//찜 버튼 눌렀을 때
router.post('/addWish', function (req, res, next) {
  var Bno = req.body.idx;
  var likeCount = req.body.like;
  var datas = [usrid, Bno]; //사용자 아이디, 게시판 번호

  if (likeCount == 0) { //찜을 하지 않은 경우
    var insertSql = "INSERT INTO WISHLIST(Uid, Bnum) VALUES(?, ?);"; //wishlist table에 삽입
    connection.query(insertSql, datas, function (err, rows) {
      if (err) console.error("err : " + err);
      res.redirect('/sellBoard/sellRead/' + String(Bno)); //기존에 보고 있던 게시글로 redirect
    })
  }
  else { //찜을 한 경우
    var deleteSql = "DELETE FROM WISHLIST WHERE Uid=? and Bnum=?"; //wishlist table에서 삭제
    connection.query(deleteSql, datas, function (err, rows) {
      if (err) console.error("err : " + err);
      res.redirect('/sellBoard/sellRead/' + String(Bno)); //기존에 보고 있던 게시글로 redirect
    })
  }
});

//메세지 화면
router.get('/message', function (req, res, next) {
  res.render('message', { title: '메세지', rootLogin, usrLogin, usrid, usrid });
})

//최근 본 상품
router.post('/recentProduct', function (req, res, next) {
  const viewedProductIds = req.body.products;
  var selectSql = "SELECT Bno, Img FROM BOARD WHERE Bno IN (?) ORDER BY FIELD(Bno, ?)"; //이미지 정보 가져오기

  connection.query(selectSql, [viewedProductIds, viewedProductIds], (err, results) => {
    if (err) throw err;
    console.log(results);

    res.json({ results });
  });
})

module.exports = router;