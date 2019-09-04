var webSocket;
var sID;

// Websocketverbindung erstellen
function createWebSocketConnection(sessionID) {

    var ws = new WebSocket('ws://webengineering.ins.hs-anhalt.de:32194/');
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
            case "beController":
                wantToBeController();
                break;
            case "isNewController":
                setControlRights();
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

        //ws.send(JSON.stringify(message));
    }

}

// Bild übertragen
function sendCanvasData(data) {
    let message = {
        "action": "update",
        "sessionID": sID,
        "canvasData": data
    }

    websocket.send(JSON.stringify(message));
}

// Steuerung übernehmen an Backend
function sendControlWish() {
    let message = {
        "action" : "setControl",
        "sessionID": sID
    }
    console.log("controlWish send");
    websocket.send(JSON.stringify(message));
}
