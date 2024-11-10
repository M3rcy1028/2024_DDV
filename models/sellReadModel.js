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
        connection.query('SELECT Nickname, Bno, Bid, Title, Content, Img, Trade, Updated, Hit, Category, Price FROM usr, board WHERE Bno=? and usr.uid = board.bid;', Bno, (err, row, fileds) => {
            if (err) throw err;
            callback(row);
        });
    }
}