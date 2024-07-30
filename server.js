const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('WebSocket 클라이언트가 연결되었습니다.');

    ws.on('message', (message) => {
        console.log(`서버가 메시지를 수신했습니다: ${message}`);
        const data = JSON.parse(message);

        if (data.roomId && data.userId && data.username) {
            console.log('방에 성공적으로 참여했습니다.');
            ws.send(JSON.stringify({
                roomId: data.roomId,
                playerA: { username: data.username }
            }));
        } else if (data.roomId && data.userId && data.problemId) {
            console.log('퀴즈 답변을 수신했습니다.');
            ws.send(JSON.stringify({
                userId: data.userId,
                isAttack: true,
                power: 100
            }));
        }
    });

    ws.on('close', () => {
        console.log('WebSocket 클라이언트가 연결을 닫았습니다.');
    });

    ws.on('error', (error) => {
        console.error(`WebSocket 오류가 발생했습니다: ${error}`);
    });
});

console.log('WebSocket 서버가 포트 8080에서 실행 중입니다.');
