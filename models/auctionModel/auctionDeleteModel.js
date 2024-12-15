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

exports.deleteRow = (datas, callback) => {
    var sql = "DELETE FROM auction WHERE Ano=?";
    connection.query(sql, datas, function (err, result) {
        if (err) console.error("글 삭제 중 에러 발생 err : " + err);
        callback(result);
    });
}