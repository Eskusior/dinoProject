// Variablen
var obstacles = [];

var multiplier = 1;

function startGame() {
    gameArea.start();
}

var gameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 600;
        this.canvas.height = 300;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        window.addEventListener("keydown", controller.keyListener);
        window.addEventListener("keyup", controller.keyListener);

        window.setInterval(addOverTime, 5000);

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
	dead: false,
	draw: function() {
		ctx = gameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

}

function Obstacle(x, type, pos) {
	this.x = x;
    
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
	this.draw = function() {
		ctx = gameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
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
	x: 300,
	y: 40,
	points: 0,
	fontSize: "30px",
	fontStyle: "Consolas",
	color: "white",
	draw: function() {
		ctx = gameArea.context;
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

function everyInterval(n) {
	if ((scoreText.points / n) % 1 == 0) {
		return true;
	}

	return false;
}

addOverTime = function() {

    multiplier =  Math.round((multiplier + 0.1) * 10) / 10;

    if(multiplier >= 10) {
        window.clearInterval(multiplier);
    }
}

function spawnRandomObstacle() {
    let randNumber = Math.floor((Math.random() * 20) + 1);
    let x = gameArea.context.canvas.width;
    
    console.log(randNumber);
    
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

	player.height +=1;

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

    let ctx = gameArea.context;

    // Score erhöhen
	scoreText.points = Math.floor(scoreText.points + (1 * multiplier));
	scoreText.text = "SCORE: " + scoreText.points;

	if(scoreText == 10 || everyInterval(200)) {
		spawnRandomObstacle();
	}

	// Komponenten aktualisieren
	ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, 600, 300);// x, y, width, height
	player.draw();
	scoreText.draw();


	for(i = 0; i < obstacles.length; i += 1) {
		obstacles[i].x -= (2 * multiplier);
		obstacles[i].draw();
	}

    ctx.strokeStyle = "#202830";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.lineTo(600, 250);
    ctx.stroke();

    for (i = 0; i < obstacles.length; i+= 1) {
		if(obstacles[i].wasHit(player)) {
			player.dead = true;
			return;
		}
    }

	// Wenn Spieler Tod --> keine Aktualisierung mehr
	if(player.dead == false) {
		window.requestAnimationFrame(loop);
	}

}