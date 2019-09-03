// Variablen
var obstacles = []; // Feld für Hindernisse

var multiplier = 1; // Multiplier für Score und Hindernisgeschwindigkeit

var isController = false; // Ist Spieler der, der Steuert

var frameNo = 0; // Anzahl der Frames

var newSessionObject; // Objekt zum Speichern des Ausgangszustandes

var restartButton = document.getElementById("restartButton");
var controlRightsButton = document.getElementById("controlRightsButton");
var menu = document.getElementById('menu');

// Spiel starten
function startGame(control) {

	isController = control; // Spieler oder Zuschauer

    gameArea.start(); 
}

function vh(v) {
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	return (v * h) / 100;
  }
  
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
        this.canvas.width = vw(50);
        this.canvas.height = vh(50);
        this.context = this.canvas.getContext("2d");
		menu.insertBefore(this.canvas, menu.childNodes[0]);
		
		newSessionObject = {
			player: JSON.parse(JSON.stringify(player)),
			scoreText: JSON.parse(JSON.stringify(scoreText))
		}

		if (isController) {
			// Steuerung laden
			window.addEventListener("keydown", controller.keyListener);
			window.addEventListener("keyup", controller.keyListener);
			// Multiplier starten
			window.setInterval(addOverTime, 5000);
	
			// Spiel starten
			window.requestAnimationFrame(loop);
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

// Spieler
var player = {
	x: 50,
	y: 210,
	width: 20,
	height: 40,
	speedY: 0,
	jumping: false,
	crouching: false,
	color: "green",
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
    
    // Überprüfung auf Kollision mit Spieler
	this.wasHit = function(playerObj) {
		var ownLeft = this.x;
		var ownRight = this.x + (this.width);
		var ownTop = this.y;
		var ownBottom = this.y + (this.height);

		// Position des Kollisionsobjektes
		var playerObjLeft = playerObj.x;
		var playerObjRight = playerObj.x + (playerObj.width);
		var playerObjTop = playerObj.y;
		var playerObjBottom = playerObj.y + (playerObj.height);

		var crashed = true;

		// Wenn keine Überlagerung --> kein Crash
		if((ownLeft > playerObjRight) || (ownRight < playerObjLeft) || (ownTop > playerObjBottom) || (ownBottom < playerObjTop)) {
			crashed = false;
		}

		return crashed;
	}

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

// Controller für Eingaben
var controller = {
	up: false,
	down: false,
	keyListener: function(event){

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
}

// Auf bestimmtes Interval prüfen, für Spawnen neuer Hindernisse
function everyInterval(n) {
	if ((frameNo / n) % 1 == 0) {
		return true;
	}

	return false;
}

// Multiplier über zeit erhöhen bis 10
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
		"multiplier": multiplier
	}

	sendCanvasData(canvasData); // An WS schicken
}

// Canvas mit empfangenen Daten updaten
function updateCanvas(data) {
	player = data.player;
	obstacles = data.obstacles;
	scoreText = data.score;
	multiplier = data.multiplier;

	drawUpdates();
}

// Canvas aktualisieren
function drawUpdates() {
	let ctx = gameArea.context; // Kontext zum Spielfeld

	// Komponenten aktualisieren
	ctx.fillStyle = "#202020";
	ctx.fillRect(0, 0, vw(50), vh(50));// x, y, width, height
	
	// Player 
	ctx.fillStyle = player.color;
	ctx.fillRect(player.x, player.y, player.width, player.height);

	// Score
	ctx.font = scoreText.fontSize + " " + scoreText.fontStyle;
	ctx.fillStyle = scoreText.color;
	ctx.fillText(scoreText.text, scoreText.x, scoreText.y);

	// Obstacles
	for(i = 0; i < obstacles.length; i += 1) {
		ctx.fillStyle = obstacles[i].color;
		ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
	}

    ctx.strokeStyle = "#202830";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.lineTo(vw(50), 250);
    ctx.stroke();
}

// Spielfluss
loop = function() {

	// Sprung
	if(controller.up && player.jumping == false) {
		player.speedY -= 20;
		player.jumping = true;
	}

	// Ducken
	if(controller.down && player.crouching == false) {
		player.height = 20;
		player.y += 20;
		player.crouching = true;
	}

	// Reset, falls Ducken gedrückt
	if(player.height > 40){
		player.height = 40;
		player.crouching = false;
	}


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

    // Score erhöhen
	scoreText.points = Math.floor(scoreText.points + (1 * multiplier));
	scoreText.text = "SCORE: " + scoreText.points;
	frameNo += 1;

    // Neues Hindernis alle 200 Frames
	if(frameNo == 1000 || everyInterval(500)) {
		spawnRandomObstacle();
	}

	// Hindernisse bewegen
	for(i = 0; i < obstacles.length; i += 1) {
		obstacles[i].x -= (2 * multiplier);
	}

	drawUpdates();

    // Hitüberprüfung
    for (i = 0; i < obstacles.length; i+= 1) {
		if(obstacles[i].wasHit(player)) {
			player.dead = true;
			restartButton.style.display = "block";
			return;
		}
    }

	// Wenn Spieler Tod --> keine Aktualisierung mehr
	if(player.dead == false) {
		window.requestAnimationFrame(loop);
	}
	
}

// Spiel neustarten
function restartGame() {

	restartButton.style.display = "none";
	gameArea.restart();
}

// Wenn Spieler --> 60mal pro Sekunde Bild übertragen
setInterval(function() {
	if(isController && player.dead == false){
		buildWsMessage();
	}
}, 1000/60);