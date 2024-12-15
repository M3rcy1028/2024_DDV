require('dotenv').config();

var mysql = require('mysql2');
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

exports.getData = (Bno, callback) => {
    connection.query('SELECT Bno, Bid, Img FROM board WHERE Bno=?;', Bno, (err, row, fileds) => {
        if (err) throw err;
        callback(row);
    });
}

exports.insertData = (datas, sellerId, callback) => {
    var sql = "INSERT INTO Review(Bnum, Rtext, Score) VALUES(?, ?, ?)"
    connection.query(sql, datas, function (err) {
        if (err) console.error("err : " + err);

        var score = datas[2];
        //score가 3 미만인 경우
        if (score < 3) {
            callback();
        }
        else {
            //score가 3 이상이면 판매자의 신뢰도 1 증가
            var updateSql = "UPDATE USR VALUE SET Trust = Trust + 1 WHERE Uid = ?";
            connection.query(updateSql, sellerId, function (err) {
                if (err) console.error("err : " + err);
                callback();
            })
        }
    })
}