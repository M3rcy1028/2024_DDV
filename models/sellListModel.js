var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tutorial'
});

module.exports = {
    getList(page, itemNums, callback) {
        const offset = (page - 1) * itemNums; //어디부터 시작할 건지
        var sql = 'SELECT Bno, Img, Title, Price FROM board LIMIT ? OFFSET ?';
        //board에서 정보 가져오기
        connection.query(sql, [itemNums, offset], (err, rows, fileds) => {
            if (err) throw err;
            callback(rows);
        })
    },

    getCategoryList(categoryName, callback) {
        var sql = 'SELECT Bno, Img, Title, Price FROM board WHERE category=?';
        //board에서 정보 가져오기
        connection.query(sql, categoryName, (err, rows, fileds) => {
            if (err) throw err;
            callback(rows);
        })
    }
}