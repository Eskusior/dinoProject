var webSocket;
var sID;

var startTime = new Date().getTime();


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

        let currTime = new Date().getTime();

        // Alle 5 Sekunden einen Timestamp loggen
        if(currTime - startTime >= (5 * 1000)) {
            evaluateTime(message.timestamp, currTime);
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
    websocket.send(JSON.stringify(message));
}

// Zeitoffset zwischen Erstellung und Bearbeitung Nachricht an Websocket senden
async function evaluateTime(mTimestamp, currTime) {
    let offset = currTime - mTimestamp;
    let message = {
        "action": "log",
        "sessionID": sID,
        "timeOffset": offset
    }
    websocket.send(JSON.stringify(message));
    startTime = currTime;
}
