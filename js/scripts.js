// Variablen
var sessionID = "";

// Verweise auf HTML Elemente zum ein-/ausblenden
var mainMenu = document.getElementById("mainMenu");
var impressum = document.getElementById("impressum");
var menu = document.getElementById('menu');

// Webservice BaseURL
var baseURL = 'http://webengineering.ins.hs-anhalt.de:32193';
//var baseURL = 'http://localhost:4000';

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
    menu.style.display = 'none';
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
async function fetchJSON(url, method) {
    const res = await fetch(url, {
        method: method
    });
    console.log("test");
    return res.json();
}

// Klick auf Impressum
function goToImpressum() {
    mainMenu.style.display = "none";
    impressum.style.display = "block";
}

// Zurück zum Hauptmenü
function goBackToMainMenu() {
    impressum.style.display = "none";
    mainMenu.style.display = "block";
}

// Register ServiceWorker
/*
window.addEventListener('load', e => {
    //new PWAConfApp();
    registerSW();
});

async function registerSW() {
    if('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./service-worker.js');
        } catch(e) {
            alert('ServiceWorker registration failed. Sorry about that.');
        }
    } 
}
*/