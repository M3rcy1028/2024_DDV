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
    getSearchList(searchWord, callback) {
        //제목에 검색어가 포함된 게시글 가져오기
        var sql = 'SELECT Bno, Img, Title, Price, Trade FROM board WHERE Title LIKE "%"?"%" OR Content LIKE "%"?"%" ORDER BY Bno DESC LIMIT 16 OFFSET 0';
        connection.query(sql, [searchWord, searchWord], (err, rows, fileds) => {
            if (err) throw err;
            callback(rows);
        })
    },

    getListRandom(callback) {
        //랜덤으로 게시글 가져오기
        var sql = 'SELECT Bno, Img, Title, Price, Trade FROM board ORDER BY Bno DESC, RAND() LIMIT 16 OFFSET 0';
        connection.query(sql, (err, rows, fileds) => {
            if (err) throw err;
            callback(rows);
        })
    }
}