// Variablen
var obstacles = []; // Feld für Hindernisse

var multiplier = 1; // Multiplier für Score und Hindernisgeschwindigkeit

var isController = false; // Ist Spieler der, der Steuert

var existingPlayer = true; // Gibt es einen Spieler

var frameNo = 0; // Anzahl der Frames

var maxWidth = 50; // Größe des Canvas
var maxHeight = 50;

var newSessionObject; // Objekt zum Speichern des Ausgangszustandes

var restartButton = document.getElementById("restartButton");
var controlRightsButton = document.getElementById("controlRightsButton");
var menu = document.getElementById('menu');

// Spiel starten
function startGame(control) {

	isController = control; // Spieler oder Zuschauer
	
	// Bei mobilen Endgeräten Optionen laden
	if(isMobile()) {
		addMobileOptions();
	}

    gameArea.start(); 
}

// Prüft, ob das benutzte Gerät kein Desktop-PC ist
function isMobile() {

	if(typeof window.orientation !== 'undefined') {
		return true;
	}

	return false;
}

// Zusätzliche Optionen für Mobil laden
function addMobileOptions() {
	screen.orientation.lock('landscape');

	maxWidth = 100;
	maxHeight = 100;
}

// Viewport Height berechnen
function vh(v) {
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	return (v * h) / 100;
  }

// Viewport Width berechnen
function vw(v) {
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	return (v * w) / 100;
}

// Spielfeld
var gameArea = {
    canvas: document.createElement("canvas"),

    // Funktion zum Initialisieren
    start: function() {

        // Canvas initialisieren
        this.canvas.width = vw(maxWidth);
        this.canvas.height = vh(maxHeight);
        this.context = this.canvas.getContext("2d");
		menu.insertBefore(this.canvas, menu.childNodes[0]);

		// Highscore für Session holen
		getExistingHighscore();
		
		
		// Initiale Daten speichern
		newSessionObject = {
			player: JSON.parse(JSON.stringify(player)),
			scoreText: JSON.parse(JSON.stringify(scoreText))
		}

		// Wenn aufrufende Person Spieler ist
		if (isController) {
			setControllerOptions();
		}
        
        
	},
	// Spiel neustarten
	restart: function() {
		player = JSON.parse(JSON.stringify(newSessionObject.player));
		obstacles = [];
		scoreText = JSON.parse(JSON.stringify(newSessionObject.scoreText));;
		multiplier = 1;
		frameNo = 0;

		//window.setInterval(addOverTime, 5000);
		window.requestAnimationFrame(loop);
	}
}

function setHighscore(points) {
	highscoreText.points = points;
	highscoreText.text = "HIGHSCORE: " + highscoreText.points;
}

// Steuerungsoptionen setzten
function setControllerOptions() {
	// Steuerung laden
	setInputListeners();
	// Multiplier starten
	window.setInterval(addOverTime, 5000);

	// Spiel starten
	window.requestAnimationFrame(loop);
}

function setInputListeners() {
	// Tastatureingabe
	window.addEventListener("keydown", keyboardInput);
	window.addEventListener("keyup", keyboardInput);

	// Mauseingabe
	window.addEventListener("mousedown", mouseInput);
	window.addEventListener("mouseup", mouseInput);

	// Toucheingabe
	window.addEventListener("touchstart", touchInput);
	window.addEventListener("touchend", touchInput);

	// Motioneingabe
	window.addEventListener("devicemotion", motionInput);

}

// Tastatureingabe
function keyboardInput(event) {
	var key_state = (event.type == "keydown") ? true : false;

		switch(event.keyCode) {

			// up
			case 38: 
				controller.up = key_state;
				break;
			// down
			case 40:
				controller.down = key_state;
				break;

		}
}

// Mauseingabe
function mouseInput(event) {
	var key_state = (event.type == "mousedown") ? true : false;

	controller.up = key_state;
}

// Toucheingabe
function touchInput(event) {
	var key_state = (event.type == "touchstart") ? true : false;

	controller.up = key_state;
}

// Motioneingabe
function motionInput(event) {
	var key_state = (event.type == "mousedown") ? true : false;

	controller.up = key_state;

}

// Spieler
var player = {
	x: 50,
	y: 210,
	width: 20,
	height: 40,
	speedY: 0,
	jumping: false,
	crouching: false,
	color: "#34eb8f",
    dead: false

}

// Hindernis 
function Obstacle(x, type, pos) {
	this.x = x;
    
    // Unterschiedliche Höhen für Vögel und Kakteen
    switch(pos) {
        case "ground":
            this.y = 230;
            break;
        case "height1":
            this.y = 210;
            break;
        case "height2":
            this.y = 170;
            break;
        default:
            this.y = 210;
    }

	this.width = 20;
	this.height = type === 'cactus' ? 40 : 20;
	this.speedX = 0,
	this.color = type === 'cactus' ? 'green' : 'gray';

}

// Hitüberprüfung
function wasHit(obstacle, player ) {
	var ownLeft = obstacle.x;
	var ownRight = obstacle.x + (obstacle.width);
	var ownTop = obstacle.y;
	var ownBottom = obstacle.y + (obstacle.height);

	// Position des Kollisionsobjektes
	var playerObjLeft = player.x;
	var playerObjRight = player.x + (player.width);
	var playerObjTop = player.y;
	var playerObjBottom = player.y + (player.height);

	var crashed = true;

	// Wenn keine Überlagerung --> kein Crash
	if((ownLeft > playerObjRight) || (ownRight < playerObjLeft) || (ownTop > playerObjBottom) || (ownBottom < playerObjTop)) {
		crashed = false;
	}

	return crashed;
}

// ScoreText
var scoreText = {
	x: vw(1),
	y: 40,
	points: 0,
	fontSize: "24px",
	fontStyle: "Consolas",
	color: "white"
}

// Highscore
var highscoreText = {
	x: vw(1),
	y: vh(maxHeight - 2),
	points: 0,
	fontSize: "24px",
	fontStyle: "Consolas",
	color: "white"
}

// Controller für Eingaben
var controller = {
	up: false,
	down: false
}

// Auf bestimmtes Interval prüfen, für Spawnen neuer Hindernisse
function everyInterval(n) {
	if ((frameNo / n) % 1 == 0) {
		return true;
	}

	return false;
}

// Multiplier über Zeit erhöhen bis 10
addOverTime = function() {

    multiplier =  Math.round((multiplier + 0.1) * 10) / 10; // Runden auf 1 Nachkommastelle

    if(multiplier >= 10) {
        window.clearInterval(multiplier); // Abbruch des Erhöhens
    }
}

// Zufälliges Objekt spawnen
function spawnRandomObstacle() {
    let randNumber = Math.floor((Math.random() * 20) + 1);
    let x = gameArea.context.canvas.width;
    
    // Je nach Zufallszahl Objekt erstellen
    switch(randNumber) {
        case 1:
            obstacles.push(new Obstacle(x, 'bird', 'ground'));
            break;
        case 2:
            obstacles.push(new Obstacle(x, 'bird', 'ground'));
            break;
        case 3:
            obstacles.push(new Obstacle(x, 'bird', 'height1'));
            break;
        case 4:
            obstacles.push(new Obstacle(x, 'bird', 'height1'));
            break;
        case 5:
            obstacles.push(new Obstacle(x, 'bird', 'height2'));
            break;
        case 6:
            obstacles.push(new Obstacle(x, 'bird', 'height2'));
            break;
        default:
            obstacles.push(new Obstacle(x, 'cactus', 'cactusGround'));
    }
}

// Nachricht für Websocket erstellen
function buildWsMessage() {
	let canvasData = {
		"player": player,
		"obstacles": obstacles,
		"score": scoreText,
		"multiplier": multiplier,
		"frameNo": frameNo
	}

	sendCanvasData(canvasData); // An WS schicken
}

// Canvas mit empfangenen Daten updaten
function updateCanvas(data) {

	// Wenn ein anderer Spieler übernommen hat
	if(!existingPlayer) {
		existingPlayer = true;
	}

	player = data.player;
	obstacles = data.obstacles;
	scoreText = data.score;
	multiplier = data.multiplier;
	frameNo = data.frameNo;

	drawUpdates();
}

// Canvas aktualisieren
function drawUpdates() {
	let ctx = gameArea.context; // Kontext zum Spielfeld

	// Komponenten aktualisieren
	ctx.fillStyle = "#202020";
	ctx.fillRect(0, 0, vw(maxWidth), vh(maxHeight));// x, y, width, height
	
	// Player 
	ctx.fillStyle = player.color;
	ctx.fillRect(player.x, player.y, player.width, player.height);

	// Score
	ctx.font = scoreText.fontSize + " " + scoreText.fontStyle;
	ctx.fillStyle = scoreText.color;
	ctx.fillText(scoreText.text, scoreText.x, scoreText.y);

	// Highscore
	ctx.font = highscoreText.fontSize + " " + highscoreText.fontStyle;
	ctx.fillStyle = highscoreText.color;
	ctx.fillText(highscoreText.text, highscoreText.x, highscoreText.y);
	
	// Obstacles
	for(i = 0; i < obstacles.length; i += 1) {
		ctx.fillStyle = obstacles[i].color;
		ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
	}

    ctx.strokeStyle = "#202830";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.lineTo(vw(maxWidth), 250);
    ctx.stroke();
}

// Bei Abbruch des Spielers Steuerungsanforderungsbutton einblenden
function wantToBeController() {
	controlRightsButton.style.display = "block";
	existingPlayer = false;
}

// Wenn User neuer Spieler ist
function setControlRights() {
	controlRightsButton.style.display = "none";
	isController = true;
	clearInterval(sendCurrentCanvasData);
	setControllerOptions();
}

// Spielfluss
loop = function() {

	// Sprung
	if(controller.up && player.jumping == false) {
		player.speedY -= 20;
		player.jumping = true;
	}

	// Ducken
	//if(controller.down && player.crouching == false) {
	//	player.height = 20;
	//	player.y += 20;
	//	player.crouching = true;
	//}

	// Reset, falls Ducken gedrückt
	//if(player.height > 40){
	//	player.height = 40;
	//	player.crouching = false;
	//}


	// Gravitation
	player.speedY += 1.3;
	player.y += player.speedY;
	player.speedY *= 0.999;

	// Nicht durch Boden fallen 
	if(player.y > 210) {
		player.jumping = false;
		player.y = 210;
		player.speedY = 0;
	}

	//highscoreText.text = "HIGHSCORE: " + highscoreText.points;

    // Score erhöhen
	scoreText.points = Math.floor(scoreText.points + (1 * multiplier));
	scoreText.text = "SCORE: " + scoreText.points;
	frameNo += 1;

    // Neues Hindernis alle 300 Frames
	if(frameNo == 1 || everyInterval(300)) {
		spawnRandomObstacle();
	}

	// Hindernisse bewegen
	for(i = 0; i < obstacles.length; i += 1) {
		obstacles[i].x -= (2 * multiplier);
	}

	drawUpdates(); // Canvas aktualisieren

    // Hitüberprüfung
    for (i = 0; i < obstacles.length; i+= 1) {
		if(wasHit(obstacles[i], player)) {
			player.dead = true;

			// Wenn Score größer als Higscore ist übertragen
			if(scoreText.points > highscoreText.points) {
				highscoreText.points = scoreText.points;
				highscoreText.text = "HIGHSCORE: " + highscoreText.points;
				sendHighscoreToDB(scoreText.points);
			}

			restartButton.style.display = "block";
			return;
		}
    }

	// Wenn Spieler Tod --> keine Aktualisierung mehr
	if(player.dead == false) {
		window.requestAnimationFrame(loop);
		//sendScoreToBackend();
	}
	
}

// Spiel neustarten
function restartGame() {

	restartButton.style.display = "none";
	gameArea.restart();
}

// Wenn Spieler --> 60mal pro Sekunde Bild übertragen
var sendCurrentCanvasData = setInterval(function() {
	if(isController && player.dead == false){
		buildWsMessage();
	}
}, 1000/60);