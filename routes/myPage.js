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

const multer = require('multer');
const path = require("path");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/profile");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });

const algorithm = 'aes-192-cbc';
const key = Buffer.from("123456789012345678901234", "utf8"); // 24바이트 키 (AES-192)
const iv = Buffer.from("1234567890123456", "utf8"); // 16바이트 IV

//마이페이지 화면 (/myPage)
router.get('/', function (req, res, next) {
    var { usrLogin, rootLogin } = require('./index'); //사용자, 관리자 로그인 여부
    var { usrid } = require('./index');

    //마이페이지에 필요한 사용자 정보
    var usrSql = "SELECT ProfileImg, Nickname, Money, Trust, State, Login FROM USR AS U, PERSON AS P WHERE uid=? and U.uid=P.pid";

    //찜한 목록 (최신순 6개)
    var likeSql = "SELECT Bno, Img, Title, Price FROM WISHLIST AS W, BOARD AS B WHERE uid=? and W.Bnum = B.Bno ORDER BY Wno DESC LIMIT 6 OFFSET 0";

    //구매 내역
    var buySql = "SELECT Bno, Img, Title, Price FROM BOARD WHERE Buyer=? ORDER BY Bno DESC LIMIT 6 OFFSET 0";

    //판매 내역 (최신순 6개)
    var sellSql = "SELECT Bno, Img, Title, Price FROM BOARD WHERE Bid=? ORDER BY Bno DESC LIMIT 6 OFFSET 0";

    //사용자가 찜해둔 목록
    connection.query(usrSql, usrid, (err, usrInfo, fileds) => {
        if (err) throw err;

        const date1 = new Date(); //현재 일자
        const date2 = new Date(usrInfo[0].Login); //가입 일자

        const diffDate = date1.getTime() - date2.getTime();
        const diff = Math.floor(Math.abs(diffDate / (1000 * 60 * 60 * 24))); //현재 일자 - 가입 일자    

        usrInfo[0].JoinedDate = diff; //가입 일자 추가

        console.log("마이페이지 정보 : ", usrInfo);

        connection.query(likeSql, usrid, (err, likeInfo, fields) => {
            if (err) throw err;
            console.log("찜 정보 : ", likeInfo);
            connection.query(buySql, usrid, (err, buyInfo, fields) => {
                if (err) throw err;
                connection.query(sellSql, usrid, (err, sellInfo, fields) => {
                    if (err) throw err;
                    //console.log("판매 정보 : ", sellInfo);
                    res.render('MypageFunction/myPage', { title: '마이페이지', rootLogin, usrLogin, usrInfo: usrInfo[0], likeInfo, buyInfo, sellInfo });
                })
            });
        });
    });
})

//마이페이지 - 정보 수정 (GET 요청)
router.get('/myInfo', function (req, res, next) {
    var { usrLogin, rootLogin } = require('./index'); //사용자, 관리자 로그인 여부
    var { usrid } = require('./index');

    var selectSql = "SELECT ProfileImg, Lname, Fname, Uid, Pwd, Nickname, Bdate, Sex, EMail FROM PERSON AS P, USR AS U WHERE U.uid = ? and U.uid = P.pid";

    connection.query(selectSql, usrid, (err, usrInfo, fileds) => {
        if (err) throw err;

        const Bdate = new Date(usrInfo[0].Bdate);
        const year = Bdate.getFullYear();
        const month = String(Bdate.getMonth() + 1).padStart(2, '0');
        const date = String(Bdate.getDate()).padStart(2, '0');
        const newBdate = year + '-' + month + '-' + date; //년도.월.날짜 형태로 표기
        usrInfo[0].Bdate = newBdate;

        console.log("회원 정보 : ", usrInfo);
        res.render('MypageFunction/myInfo', { title: '내 정보 수정', rootLogin, usrLogin, usrInfo: usrInfo[0] });
    });
})

//마이페이지 - 정보 수정 (POST 요청)
router.post('/myInfo', upload.single("profileImg"), function (req, res, next) {
    var { usrid } = require('./index');
    //수정할 정보 가져오기
    var Lname = req.body.Lname;
    var Fname = req.body.Fname;
    var Nickname = req.body.nickname;
    var Bdate = req.body.Bdate;
    var Sex = req.body.sex;
    var Email = req.body.email;
    var passwd_check = req.body.passwd_check;
    var ProfileImg;

    if (req.file == undefined) { //이미지가 없는 경우 - 기존 이미지 사용
        ProfileImg = req.body.originImg;
    }
    else { //이미지가 있는 경우
        ProfileImg = '/images/profile/' + req.file.filename; //이미지 경로
    }

    //암호화
    var encrypt = crypto.createCipheriv(algorithm, key, iv);
    var passwd = encrypt.update(passwd_check, 'utf8', 'hex') + encrypt.final('hex');

    //수정할 정보
    var datas = [ProfileImg, Lname, Fname, Nickname, Bdate, Sex, Email, usrid, passwd];

    var updateSql = "UPDATE PERSON AS P, USR AS U SET U.ProfileImg = ?, P.Lname = ?, P.Fname = ?, U.Nickname = ?, P.Bdate = ?, P.Sex = ?, P.EMail = ? WHERE U.uid = ? and U.pwd = ? and U.uid = P.pid";

    connection.query(updateSql, datas, (err, usrInfo, fileds) => {
        if (err) throw err;

        if (usrInfo.affectedRows == 0) {
            res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 변경되지 않았습니다.');history.back();</script>");
        }
        else {
            res.redirect('/myPage/myInfo');
        }
    });
})

//마이페이지 - 비밀번호 변경 (GET)
router.get('/changePwd', function (req, res, next) {
    var { usrLogin, rootLogin } = require('./index'); //사용자, 관리자 로그인 여부
    res.render('MypageFunction/changePwd', { title: "비밀번호 변경", rootLogin, usrLogin });
});

//마이페이지 - 비밀번호 변경 (POST)
router.post('/changePwd', function (req, res, next) {
    var { usrid } = require('./index');

    //암호화 (기존 비밀번호)
    var encrypt1 = crypto.createCipheriv(algorithm, key, iv);
    var passwd = encrypt1.update(req.body.passwd, 'utf8', 'hex') + encrypt1.final('hex');

    //암호화 (변경 비밀번호)
    var encrypt2 = crypto.createCipheriv(algorithm, key, iv);
    var newPasswd = encrypt2.update(req.body.newPasswd, 'utf8', 'hex') + encrypt2.final('hex');

    var datas = [newPasswd, usrid, passwd];

    var updateSql = "UPDATE USR SET PWD = ? WHERE uid = ? and pwd = ?";

    connection.query(updateSql, datas, (err, result) => {
        if (err) throw err;

        if (result.affectedRows == 0) {
            res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 변경되지 않았습니다.');history.back();</script>");
        }
        else {
            res.redirect('/myPage'); //마이페이지로 리다이렉트
        }
    })
});

//마이페이지 포인트 충전
router.post("/chargePoint", function (req, res, next) {
    var { usrid } = require('./index');

    var point = Number(req.body.point);
    var chargePoint = Number(req.body.update);
    var sumPoint = point + chargePoint;

    var encrypt = crypto.createCipheriv(algorithm, key, iv);
    var encryptResult = encrypt.update(req.body.pwd, 'utf8', 'hex') + encrypt.final('hex');

    var datas = [sumPoint, usrid, encryptResult];

    var updateSql = "UPDATE USR SET MONEY = ? WHERE uid = ? and Pwd = ?";

    connection.query(updateSql, datas, (err, result) => {
        if (err) throw err;

        if (result.affectedRows == 0) {
            //비밀번호 틀린 경우
            return res.status(401).json({
                success: false,
                message: "패스워드가 일치하지 않거나, 잘못된 요청으로 인해 변경되지 않았습니다."
            });
        }
        else {
            res.json({
                success: true,
                sumPoint: sumPoint
            });
        }
    })
});

module.exports = router;