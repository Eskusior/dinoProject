// Variablen
var sessionID = 0; // ID der derzeitigen Session --> 0 bei neuem Spiel, bis erster Score in DB
var highscore = 0; // Highscore der Session
var socketID = 0; // ID für Socketverbindung
var controlType = ""; // Typ der Steuerung - 1 oder 2 Geräte ("oneD", "twoD")
var deviceUsage = ""; // Bei 2 Geräten -> Nutzen des Gerätes ("display", "control")
var inputType = "" // Wie wird gesteuert ?

// Verweise auf HTML Elemente zum ein-/ausblenden
var menu1 = document.getElementById("m1");
var menu2 = document.getElementById("m2");
var menu3 = document.getElementById("m3");
var menu4_main = document.getElementById("m4_main");
var menu4_secondary = document.getElementById("m4_secondary");
var sessionFoundDiv = document.getElementById("sessionFound");
var noSessionFoundDiv = document.getElementById("sessionNotFound");
var loadOldSessionDiv = document.getElementById("loadOldSession");
var sessionIdInput = document.getElementById("sessionIdInput");
var sessionIdSpan = document.getElementById("sessionIdSpan");
var highscoreSpan = document.getElementById("highscoreSpan");


var Http = new XMLHttpRequest();
var baseURL = 'webengineering.ins.hs-anhalt.de:32193/session';

function setNewGame() {

    menu1.style.display = "none";
    menu2.style.display = "block";

}

function setSessionID() {
    let currSessionInput = sessionIdInput.value;

    if(currSessionInput === "") {
        sessionIdInput.style.color = "red";
    } else {
        sessionID = currSessionInput;
    }
}

