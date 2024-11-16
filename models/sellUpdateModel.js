var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tutorial'
});

exports.getData = (Bno, callback) => {
    connection.query('SELECT Bno, Title, Content, Img, Pdate, Category, Price, TradePlace FROM board WHERE Bno=?;', Bno, (err, row, fileds) => {
        if (err) throw err;
        callback(row);
    });
}

exports.updateData = (datas, callback) => {
    var sql = "UPDATE board SET Title=?, Content=?, Img=?, Category=?, Price=? WHERE Bno=?";
    connection.query(sql, datas, function (err, result) {
        if (err) console.error("글 수정 중 에러 발생 err : " + err);
        callback(result);
    });
}