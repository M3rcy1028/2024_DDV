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
        var updateSql = 'UPDATE board SET Hit = Hit + 1 WHERE Bno = ?';
        var selectSql = 'SELECT Nickname, Bno, Bid, Title, Content, Img, Trade, TradePlace, Updated, Hit, Category, Price FROM usr, board WHERE Bno=? and usr.uid = board.bid;'
        var likeSql = 'SELECT COUNT(*) AS LikeCount FROM WISHLIST WHERE Bnum=? and uid=?'; //찜을 눌렀는지 확인

        //조회 수 증가
        connection.query(updateSql, Bno, (err, result) => {
            if (err) throw err;
            //게시글 조회
            connection.query(selectSql, Bno, (err, row, fileds) => {
                if (err) throw err;

                if (usrid !== undefined) { //로그인을 한 경우
                    //찜을 했는지 확인
                    connection.query(likeSql, [Bno, usrid], (err, likeCount) => {
                        if (err) throw err;

                        callback(row, likeCount[0].LikeCount);
                    });
                } //로그인을 하지 않은 경우
                else {
                    callback(row, 0);
                }
            })
        })
    }
}