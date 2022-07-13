const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const audio = new Audio();
audio.src = "sound/sound.mp3";

let MatchTime = 50; //50 second
let GameOver = false; // check if TimeOut or player/enemy is died
const countdown_text = document.querySelector(".countdown-timer-title > h2");

const enemy_health_display = document.querySelector("#enemy-health")
const player_health_display = document.querySelector("#player-health")

class Player {
	constructor({
		x,
		y,
		width,
		height,
		health,
		speed,
		damage,
		gravity,
		color,
		attack_radius,
		attack_position,
	}) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.health = health;
		this.speed = speed;
		this.damage = damage;
		this.die = false;
		this.gravity = gravity;
		this.color = color;
		this.direction = "idle";
		this.onGround = false;
		this.attack = false;
		this.attack_radius = attack_radius; //width & height
		this.attack_position = attack_position; //right / left
		this.attack_positionY;
		this.attack_positionX;
	}

	draw() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.closePath();
	}

	draw_attack_radius() {
		if (this.attack_position === "right") {
			this.attack_positionX = this.x + this.width + 5;
			this.attack_positionY = this.y - this.height / 2 + 10;
		} else if (this.attack_position === "left") {
			this.attack_positionX = this.x + this.width - 30;
			this.attack_positionY = this.y - this.height / 2 + 10;
		}

		if (this.attack) {
			ctx.beginPath();
			ctx.fillStyle = "red";
			ctx.fillRect(
				this.attack_positionX - this.attack_radius,
				this.attack_positionY - this.attack_radius,
				this.attack_radius * 2,
				this.attack_radius * 2
			);
			ctx.closePath();
		}

		if (this.health <= 0) {
			this.health = 0;
			this.die = true;
		}
	}

	Gravity() {
		if (this.y + this.height > 0) {
			this.y += this.gravity;
		}

		if (this.y + this.height > height) {
			this.y = height - this.height;
		}

		if (this.y < 0) {
			this.y = 0;
		}

		// check if player is on ground
		if (this.y + this.height === height) {
			this.onGround = true;
		} else {
			this.onGround = false;
		}
	}

	move() {
		if (this.onGround) {
			if (this.direction === "right") {
				this.x += this.speed;
			}

			if (this.direction === "left") {
				this.x -= this.speed;
			}
		}

		if (this.x + this.width > width) {
			this.x = width - this.width;
		}

		if (this.x < 0) {
			this.x = 0;
		}
	}
}

const player = new Player({
	x: 100,
	y: 50,
	width: 25,
	height: 25,
	health: 100,
	speed: 5,
	damage: Math.floor(Math.random() * 3) + 1,
	gravity: 3,
	color: "black",
	attack_radius: 15,
	attack_position: "right",
});

const enemy = new Player({
	x: 200,
	y: 50,
	width: 25,
	height: 25,
	health: 100,
	speed: 5,
	damage: Math.floor(Math.random() * 3) + 1,
	gravity: 3,
	color: "green",
	attack_radius: 15,
	attack_position: "left",
});

//make a countDown 
const countDown = () => {
    if (MatchTime > 0) {
        MatchTime--;
        countdown_text.innerHTML = MatchTime;
        setTimeout(countDown, 1000);
    } else {
        if(!GameOver) {
            GameOver = true;
            countdown_text.innerHTML = "Game Over";
        }
    }
}


countDown();

function game() {
    requestAnimationFrame(game);
    countdown_text.innerText = MatchTime;
    
	ctx.clearRect(0, 0, width, height);

    enemy_health_display.style.width = (enemy.health / 2) + "%";
    player_health_display.style.width = (player.health / 2) + "%";
    
	player.draw();
	player.draw_attack_radius();
	player.Gravity();
	player.move();

	enemy.draw();
	enemy.draw_attack_radius();
	enemy.Gravity();
    enemy.move();
    
    if (enemy.health <= 0) {
        enemy.die = true;
        GameOver = true;
        countdown_text.innerText = "PLAYER 2 WIN";
        audio.play();
    } else if (player.health <= 0) {
        countdown_text.innerText = "PLAYER 1 WIN";
        audio.play();
        player.die = true;
        GameOver = true;
    }

    // when the audio is ended then reload the game
    if (audio.ended) {
        location.reload();
    }


	if (player.attack) {
		if (
			enemy.x + enemy.width > player.attack_positionX - player.attack_radius &&
			enemy.x < player.attack_positionX + player.attack_radius
		) {
			if (
				enemy.y + enemy.height >
					player.attack_positionY - player.attack_radius &&
				enemy.y < player.attack_positionY + player.attack_radius
			) {
				if (enemy.health > 0) {
					enemy.health -= player.damage;
				}
				console.log("enemy" + enemy.health);
			}
		}

		setTimeout(() => {
			player.attack = false;
		}, 50);
	}

	if (enemy.attack) {
		if (
			player.x + player.width > enemy.attack_positionX - enemy.attack_radius &&
			player.x < enemy.attack_positionX + enemy.attack_radius
		) {
			if (
				player.y + player.height >
					enemy.attack_positionY - enemy.attack_radius &&
				player.y < enemy.attack_positionY + enemy.attack_radius
			) {
				if (player.health > 0) {
					player.health -= enemy.damage;
				}
				console.log("player " + player.health);
			}
		}
		setTimeout(() => {
			enemy.attack = false;
		}, 50);
	}

	if (
		player.x + player.width > enemy.x &&
		player.x < enemy.x + enemy.width &&
		player.y + player.height > enemy.y &&
		player.y < enemy.y + enemy.height
	) {
		if (player.x !== 0) {
			player.x = enemy.x - player.width;
		} else {
			enemy.x = player.x + player.width;
		}
	}
}

addEventListener("keydown", (e) => {
	if (e.key === "a") {
		player.direction = "left";
	} else if (e.key === "d") {
		player.direction = "right";
	}

	if (e.key === "ArrowLeft") {
		enemy.direction = "left";
	} else if (e.key === "ArrowRight") {
		enemy.direction = "right";
	}
});

addEventListener("keyup", (e) => {
	if (e.key === "a" || e.key === "d") {
		player.direction = "idle";
	}

	if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
		enemy.direction = "idle";
	}
});

addEventListener("keypress", function (e) {
	if (e.key === " ") {
		player.attack = true;
	}

	if (e.key === "Enter") {
		enemy.attack = true;
	}
});

game();
