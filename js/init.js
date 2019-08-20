// Variablen
var player;
var cactusObs = [];
var scoreText;

var context = document.querySelector("canvas").getContext("2d");

context.canvas.height = 300;
context.canvas.width = 600;

// Spieler
var player = {
	x: 50,
	y: 210,
	width: 20,
	height: 40,
	speedY: 0,
	jumping: false,
	color: "green",
	dead: false,
	draw: function() {
		ctx = context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

}

// Kaktusobjekt, später Objektkonstruktor
var cactusObs = {
	x: 0,
	y: 0,
	width: 20,
	height: 40,
	speedX: 0,
	color: "green",
	draw: function() {
		ctx = context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	},
	wasHit: function(playerObj) {

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
	x: 400,
	y: 40,
	points: 0,
	fontSize: "30px",
	fontStyle: "Consolas",
	color: "white",
	draw: function() {
		ctx = context;
		ctx.font = this.fontSize + " " + this.fontStyle;
		ctx.fillStyle = this.color;
		ctx.fillText(this.text, this.x, this.y);
	}
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

// Spielfluss
loop = function() {

	// Sprung
	if(controller.up && player.jumping == false) {
		player.speedY -= 20;
		player.jumping = true;
	}

	// Ducken
	if(controller.down) {
		player.height = 20;
	}

	// Reset, falls Ducken gedrückt
	player.height = 40;

	// Gravitation
	player.speedY += 1.5;
	player.y += player.speedY;
	player.speedY *= 0.9;

	// Nicht durch Boden fallen 
	if(player.y > 210) {
		player.jumping = false;
		player.y = 210;
		player.speedY = 0;
	}

	// Score erhöhen
	scoreText.points += 1;
	scoreText.text = "SCORE: " + scoreText.points;

	// Komponenten aktualisieren
	context.fillStyle = "#202020";
    context.fillRect(0, 0, 600, 300);// x, y, width, height
	player.draw();
	scoreText.draw();
	
    context.strokeStyle = "#202830";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(0, 250);
    context.lineTo(600, 250);
    context.stroke();

	// Wenn Spieler Tod --> keine Aktualisierung mehr
	if(player.dead == false) {
		window.requestAnimationFrame(loop);
	}

}


window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup", controller.keyListener);

window.requestAnimationFrame(loop);

// Komponenten Constructor
function component(width, height, color, x, y, type, jumping=false) {
	// Variablen der Komponente
	this.type = type;
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.jumping = jumping
	this.gravity = 0.05;
	this.gravitySpeed = 0;
	this.x = x;
	this.y = y;
	// Update der Komponente pro Frame
	this.update = function() {
		ctx = gameArea.context;

		if(this.type == "text") {
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = color;
			ctx.fillText(this.text, this.x, this.y);
		}else {	
			ctx.fillStyle = color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}
	// Position aktualisieren
	this.newPos = function() {
		this.gravitySpeed += this.gravity;
		this.x += this.speedX;
		this.y += this.speedY + this.gravitySpeed;
		this.hitBottom();
	}

	this.hitBottom = function() {
		var rockbottom = 200;
		if(this.y > rockbottom) {
			this.y = rockbottom;
		}
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


