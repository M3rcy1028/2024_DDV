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

exports.getData = (Rno, callback) => {
    connection.query('SELECT Rno, Img, Rtext, Score FROM Board AS B, Review AS R WHERE R.Rno=? and B.Bno = R.Bnum;', Rno, (err, row, fileds) => {
        if (err) throw err;
        callback(row);
    });
}

exports.updateData = (datas, callback) => {
    var sql = "UPDATE review SET Rtext=?, Score=? WHERE Rno=?";
    connection.query(sql, datas, function (err, result) {
        if (err) console.error("글 수정 중 에러 발생 err : " + err);
        callback(result);
    });
}