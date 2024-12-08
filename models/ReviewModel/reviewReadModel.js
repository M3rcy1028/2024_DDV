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
    getData(Rno, callback) {
        var sql = "SELECT Img, Title, Price, Rtext, Score FROM Board AS B, Review AS R WHERE R.Rno=? and B.Bno = R.Bnum;";
        connection.query(sql, Rno, (err, row) => {
            if (err) throw err;

            callback(row);
        })
    }
}