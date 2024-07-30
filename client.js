const SockJS = require('sockjs-client');
const Stomp = require('stompjs');

// WebSocket 연결 설정
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
    console.log('Connected: ' + frame);

    // 특정 토픽을 구독
    stompClient.subscribe('/topic/quiz/123', (message) => {
        console.log('Received: ' + message.body);
        // 메시지 처리 로직 추가
    });

    // 방에 참가하는 예제
    const joinRoomDTO = {
        roomId: 123,
        userId: 'user123',
        username: 'User123',
        roomPassword: 'password'
    };
    stompClient.send('/app/quiz/join', {}, JSON.stringify(joinRoomDTO));

    // 퀴즈 답변 보내는 예제
    const solved = {
        roomId: 123,
        userId: 'user123',
        answer: 'Answer'
    };
    stompClient.send('/app/quiz/answer', {}, JSON.stringify(solved));
}, (error) => {
    console.log('Error: ' + error);
});
