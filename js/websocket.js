var webSocket;
var sID;

// Websocketverbindung erstellen
function createWebSocketConnection(sessionID) {

    var ws = new WebSocket('ws://127.0.0.1:6789/');
    websocket = ws;
    sID = sessionID;
    var canControl = false;


    // Initial die SessionID übermitteln
    ws.onopen = function () {
        let message = {
            action: 'register',
            sessionID: sessionID

        };

        ws.send(JSON.stringify(message));
    };

    // Empfang einer neuen Nachricht
    ws.onmessage = function (event) {
        message = JSON.parse(event.data);

        switch(message.type){
            case "registered control":
                canControl = true;
                startGame(canControl);
                break;
            case "registered noControl":
                canControl = false;
                startGame(canControl);
                break;
            case "update":
                if(canControl == false) {
                    updateCanvas(message.message);
                }
                break;
        }

    };

    // Error loggen
    ws.onerror = function (error) {
        console.log('Websocket Error: ' + error);
    }

    // Beim Schließen User abmelden von Session
    ws.onclose = function() {
        let message = {
            action: 'unregister',
            sessionID: sessionID,
            canControl: canControl
        };

        ws.send(JSON.stringify(message));
    }

}


function sendNewMessage(data, type) {
    let message = {
        "action": "update",
        "sessionID": sID,
        "canvasData": data
    }
    console.log(message);
    websocket.send(JSON.stringify(message));
}