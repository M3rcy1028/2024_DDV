var mysql = require('mysql');
var connection = mysql.createConnection({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tutorial'
});

module.exports = {
    insertData(datas, callback) {
        var sql = "INSERT INTO board(Bid, Title, Hit, Content, Img, Pdate, Category, Price, TradePlace, Trade, Modified) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        connection.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));
            callback();
        })
    }
}