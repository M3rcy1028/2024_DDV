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
    getData(Bno, usrid, callback) {
        var selectSql = 'SELECT Nickname, Ano, Title, Content, Img, Seller, Smoney,Emoney, Stime, Timeover FROM usr, auction WHERE Ano=? and uid = seller;'

        connection.query(selectSql, [Bno], (err, row, fileds) => {
            if (err) throw err;
            callback(row);
        })
    }
}