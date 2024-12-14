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
    // Bnum, Sid, Rid 조합이 유니크한지 확인
    const checkSql = "SELECT COUNT(*) AS count FROM chatroom WHERE Bnum = ? AND Sid = ? AND Rid = ?";
    connection.query(checkSql, [datas.idx, datas.sid, datas.rid], function (err, results) {
        if (err) {
            console.error("중복 확인 중 에러 발생 err : " + err);
            return callback(null, err); // 에러 발생 시 callback에 에러 전달
        }

        // 중복되지 않은 경우에만 채팅방 생성
        if (results[0].count === 0) {
            const insertSql = "INSERT INTO chatroom(Bnum, Sid, Rid) VALUES(?,?,?)";
            connection.query(insertSql, [datas.idx, datas.sid, datas.rid], function (insertErr, result) {
                if (insertErr) {
                    console.error("채팅방 생성 중 에러 발생 err : " + insertErr);
                    return callback(null, insertErr); // 에러 발생 시 callback에 에러 전달
                }
                console.log("채팅방 생성 완료");

                console.log(result);

                // 기본 인사(채팅방 생성 시간 대용)
                const messageQuery = "INSERT INTO msglog(Cnum, Sender, Message) VALUES(?,?,?)";
                connection.query(messageQuery, [result.insertId, datas.sid, "안녕하세요?"], (_err, _result) => {
                    if (_err) {
                        console.error("기본 메시지 삽입 중 에러 발생 err:", _err);
                    } else {
                        console.log("기본 메시지 삽입 완료");
                    }
                });
                callback(result, null); // 성공 시 결과 전달
            });
        } else {
            console.log("이미 존재하는 채팅방 조합입니다.");
            callback({ message: "Duplicate Chatroom" }, null); // 중복 알림 전달
        }
    });
};
