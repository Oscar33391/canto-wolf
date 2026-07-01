const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 呢度設定 Port：優先用雲端平台俾你嘅 Port，冇嘅話本機就用 3000
const PORT = process.env.PORT || 3000;

// 叫 Server 讀取 public 資料夾入面嘅 HTML 網頁
app.use(express.static(path.join(__dirname, 'public')));

// 核心：當有玩家用網頁連過嚟嗰陣
io.on('connection', (socket) => {
    console.log(`有人連線入嚟喇！Socket ID 係: ${socket.id}`);

    // 聽前端講：我想入房
    socket.on('joinRoom', ({ username, roomCode }) => {
        if (!username || !roomCode) return;

        // 將房號自動轉做大楷，方便對齊
        const code = roomCode.trim().toUpperCase();

        // 幫呢個玩家加入 Socket.io 嘅指定房間群組
        socket.join(code);

        // 將玩家嘅名塞入 socket 紀錄，方便佢斷線時話俾人知邊個走咗
        socket.username = username;
        socket.roomCode = code;

        // 發送訊息俾呢間房入面所有連緊線嘅人（包括啱啱入嚟嗰個）
        // 話俾大家知：某某人入咗嚟呢間房
        io.to(code).emit('newMessage', `${username} 成功塞咗入嚟房間 [${code}] 喇！`);
    });

    // 當有人熄咗網頁或者斷線
    socket.on('disconnect', () => {
        if (socket.username && socket.roomCode) {
            // 廣播話俾同房嘅人知佢走咗
            io.to(socket.roomCode).emit('newMessage', `❌ ${socket.username} 走咗人、斷咗線。`);
        }
    });
});

// 開動 Server 聽外網所有連線
server.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🐺 廣東話狼人殺 Server 已經開動！`);
    console.log(`🔗 本地測試網址 ➔ http://localhost:${PORT}`);
    console.log(`=========================================`);
});
