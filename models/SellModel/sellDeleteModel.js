var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'ddv'
});

exports.deleteRow = (datas, callback) => {
    var sql = "DELETE FROM board WHERE Bno=?";
    connection.query(sql, datas, function (err, result) {
        if (err) console.error("글 삭제 중 에러 발생 err : " + err);
        callback(result);
    });
}