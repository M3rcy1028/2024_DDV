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
        //조회수
        var updateSql = 'UPDATE board SET Hit = Hit + 1 WHERE Bno = ?';
        //게시글 정보
        var selectSql = 'SELECT Nickname, Bno, Bid, Title, Content, Img, Trade, TradePlace, Updated, Hit, Category, Price FROM usr, board WHERE Bno=? and usr.uid = board.bid;'
        //찜 여부
        var likeSql = 'SELECT EXISTS(SELECT 1 FROM WISHLIST WHERE Bnum=? AND uid=?) AS LikeCount';
        //후기
        var reviewSql = "SELECT Rno, Nickname, Buyer, Score, Rtext FROM BOARD AS B, REVIEW AS R, USR AS U WHERE B.Bno=? AND B.Bno = R.Bnum AND B.Buyer = U.Uid";

        //조회 수 증가
        connection.query(updateSql, Bno, (err) => {
            if (err) throw err;
            //게시글 조회
            connection.query(selectSql, Bno, (err, row, fileds) => {
                if (err) throw err;
                connection.query(reviewSql, Bno, (err, review) => {
                    if (err) throw err;
                    if (usrid !== undefined) { //로그인을 한 경우
                        //찜을 했는지 확인
                        connection.query(likeSql, [Bno, usrid], (err, likeCount) => {
                            if (err) throw err;

                            callback(row, review, likeCount[0].LikeCount);
                        });
                    } //로그인을 하지 않은 경우
                    else {
                        callback(row, review, 0);
                    }
                })
            })
        })
    }
}