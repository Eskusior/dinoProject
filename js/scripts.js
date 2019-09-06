// Variablen
var sessionID = "";

// Verweise auf HTML Elemente zum ein-/ausblenden
var mainMenu = document.getElementById("mainMenu");
var menu = document.getElementById('menu');

// Webservice BaseURL
//var baseURL = 'http://webengineering.ins.hs-anhalt.de:32193';
var baseURL = 'http://localhost:4000';

// Neues Spiel Klick --> Session erstellen und Redirect
function setNewGame() {
    var url = baseURL + '/game';
    createNewSession(url);
}

// session aus URL auslesen, falls vorhanden
function getQueryParams() {
    var sID = window.location.pathname.substr(6);
    
    // Wenn SessionID vorhanden --> Spiel starten
    if(sID != '') {
        sessionID = sID;
        initializeGame(sessionID);
    }
}

// Menü ausblenden und Spiel starten
function initializeGame(sessionID) {
    mainMenu.style.display = 'none';
    createWebSocketConnection(sessionID);
}

// Neue Session anlegen
async function createNewSession(url) {
    const res = await fetch(url, {
        method: 'POST'
    });
    window.location.replace(res.url)
}

// HTTP Call auf URL und Rückgabe als JSON
async function fetchJSON(url, method, body = null) {
    let res;
    if(body != null) {
        res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    } else {
        res = await fetch(url, {
            method: method
        });
    }
 
    let json = await res.json();
    return json;
}

// Highscore holen, falls vorhanden
async function getExistingHighscore() {
    let url = baseURL + "/highscore/" + sessionID
    fetchJSON(url, "GET").then(res => {
        if(res.highscore){
            setHighscore(res.highscore);
        }
    });
    setHighscore(0);
}

// Highscore an DB schicken
async function sendHighscoreToDB(highscore) {
    let url = baseURL + '/highscore/' + sessionID;
    let body = {
        "sessionID": sessionID,
        "highscore": highscore
    }

    fetchJSON(url, "POST", body);

    
}
