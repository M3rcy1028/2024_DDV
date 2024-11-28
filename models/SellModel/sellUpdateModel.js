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
    connection.query('SELECT Bno, Title, Content, Img, Pdate, Category, Price, TradePlace FROM board WHERE Bno=?;', Bno, (err, row, fileds) => {
        if (err) throw err;
        callback(row);
    });
}

exports.updateData = (datas, callback) => {
    var sql = "UPDATE board SET Title=?, Content=?, Img=?, Category=?, Price=?, Modified=1 WHERE Bno=?";
    connection.query(sql, datas, function (err, result) {
        if (err) console.error("글 수정 중 에러 발생 err : " + err);
        callback(result);
    });
}