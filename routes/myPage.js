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

//마이페이지 화면 (/myPage)
router.get('/', function (req, res, next) {
    var { usrLogin, rootLogin } = require('./index'); //사용자, 관리자 로그인 여부
    var { usrid } = require('./index');

    //마이페이지에 필요한 사용자 정보
    var usrSql = "SELECT ProfileImg, Nickname, Money, Trust, State FROM USR WHERE uid=?";

    //찜한 목록 (최신순 6개)
    var likeSql = "SELECT Bno, Img, Title, Price FROM WISHLIST AS W, BOARD AS B WHERE uid=? and W.Bnum = B.Bno ORDER BY Wno DESC LIMIT 6 OFFSET 0";

    //구매 내역
    var buySql = "SELECT Bno, Img, Title, Price FROM BOARD WHERE Buyer=? ORDER BY Bno DESC LIMIT 6 OFFSET 0";

    //판매 내역 (최신순 6개)
    var sellSql = "SELECT Bno, Img, Title, Price FROM BOARD WHERE Bid=? ORDER BY Bno DESC LIMIT 6 OFFSET 0";

    //사용자가 찜해둔 목록
    connection.query(usrSql, usrid, (err, usrInfo, fileds) => {
        if (err) throw err;
        //console.log("마이페이지 정보 : ", usrInfo);
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

    var selectSql = "SELECT Lname, Fname, Uid, Pwd, Nickname, Bdate, Sex, EMail FROM PERSON AS P, USR AS U WHERE U.uid = ? and U.uid = P.pid";

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
router.post('/myInfo', function (req, res, next) {
    var { usrid } = require('./index');
    //수정할 정보 가져오기
    var Lname = req.body.Lname;
    var Fname = req.body.Fname;
    var Nickname = req.body.nickname;
    var Bdate = req.body.Bdate;
    var Sex = req.body.sex;
    var Email = req.body.email;

    //수정할 정보
    var datas = [Lname, Fname, Nickname, Bdate, Sex, Email, usrid];

    var updateSql = "UPDATE PERSON AS P, USR AS U SET P.Lname = ?, P.Fname = ?, U.Nickname = ?, P.Bdate = ?, P.Sex = ?, P.EMail = ? WHERE U.uid = ? and U.uid = P.pid";

    connection.query(updateSql, datas, (err, usrInfo, fileds) => {
        if (err) throw err;
        res.redirect('/myPage/myInfo');
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
    var passwd = req.body.passwd;
    var newPasswd = req.body.newPasswd;

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

module.exports = router;