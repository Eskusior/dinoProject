// Variablen
var player;
var cactusObs = [];

// Startfunktion des Spiels
function startGame() {
	gameArea.start(); // Canvas init
	player = new component(20, 40, "blue", 10, 200); // Spieler init
}

// GameArea Objekt
var gameArea = {
	canvas: document.createElement("canvas"), // Canvas Typ

	// onInit
	start: function() {
		// Größe, Breite, Context und an Body anfügen
		this.canvas.width = 480;
		this.canvas.height = 270;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.frameNo = 0;
		this.interval = setInterval(updateGameArea, 20); // 50 FPS

		// Eventlistener für Steuerung
		window.addEventListener('keydown', function (e) {
			gameArea.key = e.keyCode;
		})
		window.addEventListener('keyup', function (e) {
			gameArea.key = false;
		})
	},
	clear: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	// Stop bei Kollision
	stop: function() {
		clearInterval(this.interval);
	}
}

// Komponenten Constructor
function component(width, height, color, x, y) {
	// Variablen der Komponente
	this.gameArea = gameArea;
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.x = x;
	this.y = y;
	// Update der Komponente pro Frame
	this.update = function() {
		ctx = gameArea.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	// Position aktualisieren
	this.newPos = function() {
		this.x += this.speedX;
		this.y += this.speedY;
	}
	//Kollisionsdetektion
	this.crashWith = function(otherobj) {
		// Eigene Position
		var ownLeft = this.x;
		var ownRight = this.x + (this.width);
		var ownTop = this.y;
		var ownBottom = this.y + (this.height);

		// Position des Kollisionsobjektes
		var otherObjLeft = otherobj.x;
		var otherObjRight = otherobj.x + (otherobj.width);
		var otherObjTop = otherobj.y;
		var otherObjBottom = otherobj.y + (otherobj.height);

		var crashed = true;

		// Wenn keine Überlagerung --> kein Crash
		if((ownLeft > otherObjRight) || (ownRight < otherObjLeft) || (ownTop > otherObjBottom) || (ownBottom < otherObjTop)) {
			crashed = false;
		}

		return crashed;

	}
	
}

// Update der GameArea pro Frame
function updateGameArea() {

	var x, y;

	for(i = 0; i < cactusObs.length; i += 1) {
		if(player.crashWith(cactusObs[i])) {
			gameArea.stop();
			return;
		}
	}

	gameArea.clear();
	gameArea.frameNo += 1;

	if(gameArea.frameNo == 1 || everyInterval(150)) {
		x = gameArea.canvas.width;
		y = gameArea.canvas.height - 70;
		cactusObs.push(new component(20 , 40, "green", x , y));
	}

	for(i = 0; i < cactusObs.length; i += 1) {
		cactusObs[i].x += -1;
		cactusObs[i].update();
	}

	player.newPos();
	player.update();
}

function everyInterval(n) {
	if((gameArea.frameNo / n) % 1 == 0) {
		return true;
	}

	return false;
}

// Steuerungsfunktion des Spielers
function playerMovement() {
	player.speedX = 0;
	player.speedY = 0;

	if(gameArea.key && gameArea.key == 38) {
		player.speedY -= 1;
	}

	if(gameArea.key && gameArea.key == 40) {
		player.speedY +=1;
	}

}

