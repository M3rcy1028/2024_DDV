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

module.exports = {
    insertData(datas, callback) {
        var sql = "INSERT INTO auction(Title, Content, Img, Seller, Smoney) VALUES(?,?,?,?,?)"
        connection.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));
            callback();
        })
    }
}