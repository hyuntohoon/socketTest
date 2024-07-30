let stompClient = null;

function setConnected(connected) {
    console.log('Connection status: ', connected);
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    } else {
        $("#conversation").hide();
    }
    $("#greetings").html("");
}

function connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);

        // 메시지 및 퀴즈 결과를 구독
        stompClient.subscribe('/topic/messages', function (message) {
            console.log('Received: ' + message.body);
            showGreeting(JSON.parse(message.body));
        });
    }, function (error) {
        console.log('STOMP error: ' + error);
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function joinRoom() {
    const joinRoomDTO = {
        roomId: $("#roomId").val(),
        userId: $("#userId").val(),
        username: $("#username").val(),
        roomPassword: $("#roomPassword").val()
    };
    console.log('Joining room with data: ', joinRoomDTO);
    stompClient.send("/app/quiz/join", {}, JSON.stringify(joinRoomDTO));
}

function createRoom() {
    const userId = $("#userId").val();
    const createRoomDTO = {
        roomPassword: $("#roomPassword").val()
    };
    $.ajax({
        url: 'http://localhost:8080/battle/room',
        type: 'POST',
        headers: {
            'userId': userId
        },
        contentType: 'application/json',
        data: JSON.stringify(createRoomDTO),
        success: function(response) {
            console.log('Room created with ID: ', response);
            $("#roomId").val(response);
        },
        error: function(error) {
            console.error('Error creating room: ', error);
        }
    });
}

function sendAnswer() {
    const solved = {
        problemId: parseInt($("#problemId").val()),
        userId: parseInt($("#userId").val()),
        solve: {
            1: parseInt($("#answer").val()) // 예시로 solve 객체에 값을 넣음
        },
        submitTime: parseInt($("#submitTime").val()),
        roomId: $("#roomId").val()
    };
    console.log('Sending answer: ', JSON.stringify(solved));
    stompClient.send("/app/quiz/answer", {}, JSON.stringify(solved));
}

function showGreeting(message) {
    $("#greetings").append("<tr><td>" + message + "</td></tr>");
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#connect").click(function () { 
        console.log('Connect button clicked');
        connect(); 
    });
    $("#disconnect").click(function () { 
        console.log('Disconnect button clicked');
        disconnect(); 
    });
    $("#join").click(function () { 
        console.log('Join button clicked');
        joinRoom(); 
    });
    $("#createRoom").click(function () { 
        console.log('Create Room button clicked');
        createRoom(); 
    });
    $("#sendAnswer").click(function () { 
        console.log('Send Answer button clicked');
        sendAnswer(); 
    });
});
