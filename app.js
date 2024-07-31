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
    // solve 객체를 Map 형식에 맞게 작성
    const solveMap = {};
    $(".solve").each(function() {
        const key = parseInt($(this).data("key")); // data-key 속성을 사용하여 키를 가져옴
        const value = parseInt($(this).val()); // 값을 가져옴
        solveMap[key] = value;
    });

    // DTO에 맞게 solved 객체를 생성
    const solved = {
        problemId: parseInt($("#problemId").val()),
        userId: parseInt($("#userId").val()),
        solve: solveMap,
        submitTime: parseInt($("#submitTime").val()),
        roomId: $("#roomId").val(),
        round: parseInt($("#round").val())
    };

    // 콘솔에 출력 및 STOMP 클라이언트를 사용하여 메시지 전송
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
