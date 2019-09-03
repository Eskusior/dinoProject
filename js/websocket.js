// Websocketverbindung erstellen
function createWebSocketConnection(sessionID) {

    var ws = new WebSocket('ws://127.0.0.1:6789/');


    // Initial die SessionID übermitteln
    ws.onopen = function () {
        let message = {
            action: 'register',
            sessionID: sessionID

        };

        console.log(message);

        ws.send(JSON.stringify(message));
    };

    ws.onmessage = function (event) {
        message = JSON.parse(event.data);

        switch(data.type){
            case "registered control":
                console.log("Steuerung");
                break;
            case "registered noControl":
                console.log("Keine Steuerung");
                break;
        }

    };

    ws.onerror = function (error) {
        console.log('Websocket Error: ' + error);
    }

    ws.onclose = function() {
        let message = {
            action: 'unregister',
            sessionID: sessionID
        };

        ws.send(JSON.stringify(message));
    }

}
