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

exports.createChat = (datas, callback) => {
    var sql = "INSERT INTO chatroom(Bnum, Sid, Rid) VALUES(?,?,?)";
    connection.query(sql, [datas.idx, datas.sid, datas.rid], function (err, result) {
        if (err) console.error("채팅방 생성 중 에러 발생 err : " + err);
        callback(result);
    });
}