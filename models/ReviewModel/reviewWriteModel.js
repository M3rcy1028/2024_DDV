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
    connection.query('SELECT Bno, Img FROM board WHERE Bno=?;', Bno, (err, row, fileds) => {
        if (err) throw err;
        callback(row);
    });
}

exports.insertData = (datas, callback) => {
    var sql = "INSERT INTO Review(Bnum, Rtext, Score) VALUES(?, ?, ?)"
    connection.query(sql, datas, function (err, rows) {
        if (err) console.error("err : " + err);
        console.log("rows : " + JSON.stringify(rows));
        callback();
    })
}