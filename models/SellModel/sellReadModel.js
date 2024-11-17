var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tutorial'
});

module.exports = {
    getData(Bno, callback) {
        var updateSql = 'UPDATE board SET Hit = Hit + 1 WHERE Bno = ?';
        var selectSql = 'SELECT Nickname, Bno, Bid, Title, Content, Img, Trade, TradePlace, Updated, Hit, Category, Price FROM usr, board WHERE Bno=? and usr.uid = board.bid;'

        //조회 수 증가
        connection.query(updateSql, Bno, (err, result) => {
            if (err) throw err;
            //게시글 조회
            connection.query(selectSql, Bno, (err, row, fileds) => {
                if (err) throw err;
                callback(row);
            })
        })
    }
}