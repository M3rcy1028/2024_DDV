var mysql = require('mysql');
var connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = {
    getList(page, itemNums, callback) {
        const offset = (page - 1) * itemNums; //어디부터 시작할 건지
        var sql = 'SELECT Bno, Img, Title, Price, Trade FROM board ORDER BY Bno DESC LIMIT ? OFFSET ?';
        //board에서 정보 가져오기
        connection.query(sql, [itemNums, offset], (err, rows, fileds) => {
            if (err) throw err;
            callback(rows);
        })
    },

    getCategoryList(page, itemNums, categoryName, callback) {
        const offset = (page - 1) * itemNums; //어디부터 시작할 건지
        var sql = 'SELECT Bno, Img, Title, Price, Trade FROM board WHERE category=? ORDER BY Bno DESC LIMIT ? OFFSET ?';
        //board에서 정보 가져오기
        connection.query(sql, [categoryName, itemNums, offset], (err, rows, fileds) => {
            if (err) throw err;
            callback(rows);
        })
    }
}