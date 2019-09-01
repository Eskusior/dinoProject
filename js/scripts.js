// Variablen


// Verweise auf HTML Elemente zum ein-/ausblenden
var mainMenu = document.getElementById("mainMenu");
var impressum = document.getElementById("impressum");

// Webservice BaseURL
//var baseURL = 'http://webengineering.ins.hs-anhalt.de:32193/session';
var baseURL = 'http://localhost:4000';

// Neues Spiel Klick --> Wechsel zu Menü 2
function setNewGame() {
    var url = baseURL + '/test';
    console.log("test");
    fetchJSON(url, 'POST');

}


async function fetchJSON(url, method) {
    const res = await fetch(url, {
        method: method
    });
    return res.json();
}

function goToImpressum() {
    mainMenu.style.display = "none";
    impressum.style.display = "block";
}

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


// Alte Session finden mit Value aus Input
function setSessionID() {
    let currSessionInput = sessionIdInput.value;

    if(currSessionInput === "") {
        sessionIdInput.style.border = "1px solid red"; // Feld leer
    } else {
        sessionID = currSessionInput;

        // GET auf Backend mit ID
        fetch(baseURL + '/' + sessionID).then(response => {
                return response.json();
        }).then(json => {
                
            // Wenn Session nicht gefunden
            if(json.statuscode) {
                sessionID = 0;
                loadOldSessionDiv.style.display = 'none';
                noSessionFoundDiv.style.display = 'block';
            }
            // Ansonsten 
            else {
                sessionIdSpan.innerHTML = "Session-ID: " + JSON.stringify(json.id);
                highscoreSpan.innerHTML = "Highscore: " + JSON.stringify(json.highscore);
                loadOldSessionDiv.style.display = 'none';
                sessionFoundDiv.style.display = 'block';
            }


        });

    }
}