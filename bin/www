#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('dbproject:server');
var http = require('http');
var { Server } = require("socket.io")

const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});




/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
const io = new Server(server);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

io.on('connection', (socket) => {
  console.log(socket.id, "connected")
  const chatroomId = socket.handshake.auth.cnum;

  const userId = "M3rcy"; // 예시로 sid 또는 rid로 사용할 값, 실제로는 세션에서 가져올 수 있습니다.

  // 채팅방 가져오기 (sid 또는 rid와 일치하는 채팅방)
  const query = `SELECT * FROM chatroom WHERE sid = ? OR rid = ?`;
  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error('쿼리 오류:', err);
      return res.status(500).send('서버 오류');
    }
    socket.emit('load_chatrooms', results);
  });

  // if (chatroomId) {
  //   // cnum에 해당하는 채팅 기록을 DB에서 가져오기
  //   db.query('SELECT Message, Sender FROM MSGLOG WHERE Cnum = ?',
  //     [chatroomId],
  //     (_err, results) => {
  //       results.forEach((row) => {
  //         console.log(row.Message);  // 각 메시지를 로그로 확인

  //         // 각 메시지를 'chat_message' 이벤트로 클라이언트에게 전송
  //         socket.emit('chat_message', row.Message, row.Sender, row.Receiver);
  //       })
  //     });
  // }

  socket.on('load_chatlog', (cno) => {
    db.query('SELECT Message, Sender FROM MSGLOG WHERE Cnum = ?',
      [cno],
      (_err, results) => {  // 각 메시지를 로그로 확인
        // 각 메시지를 'chat_message' 이벤트로 클라이언트에게 전송
        socket.emit('load_chatlog', results);
      });
  })

  socket.on('chat_message', (data) => {
    console.log(socket.id, ":", data)
    try {
      db.query("INSERT INTO msglog (cnum, sender, message) VALUES (?,?,?)", [data.cnum, data.sender, data.message], (err, result) => {
        if (err) {
          console.error(err);
        }
      })
    } catch (e) {
      return;
    }
    msg = {
      Sender: data.sender,
      Message: data.message
    }
    io.emit('chat_message', msg);
  });

  if (!socket.recovered) {
    // if the connection state recovery was not successful
    try {
      db.each('SELECT Mno, Message FROM msglog WHERE cnum = ?',
        [socket.handshake.auth.cnum],
        (_err, row) => {
          console.log(row.Message)
          socket.emit('chat_message', row.Message, row.Mno);
        }
      )
    } catch (e) {
      // something went wrong
    }
  }
});


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
