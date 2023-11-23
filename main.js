const canvas = document.getElementById("canvas")

// setup canvas height and width to windows height and width

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

canvas.height = sizes.height
canvas.width = sizes.width

const c = canvas.getContext("2d")

// Create a Player class

class Player {
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		//add a css class name"player" to the player
	}

	// Draw the player
	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}
}

//TODO Create a Projectile class
let count = 0
class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		c.beginPath()
		count++
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}

	update() {
		this.draw()
		this.x += this.velocity.x
		this.y += this.velocity.y
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		c.beginPath()
		count++
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}

	update() {
		this.draw()
		this.x += this.velocity.x
		this.y += this.velocity.y
	}
}

const centerPosition = {
	x: canvas.width / 2,
	y: canvas.height / 2,
}

// Create a new player object
const player = new Player(centerPosition.x, centerPosition.y, 30, "white")

const projectile = new Projectile(
	centerPosition.x,
	centerPosition.y,
	300,
	"red",
	{
		x: 1,
		y: 1,
	}
)

function spawnEnemeies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4 // (max-min) + min
		let x
		let y

		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
			y = Math.random() * canvas.height
		} else {
			x = Math.random() * canvas.width
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
		}

		const color = `hsl(${Math.random() * 360},50%,50%)`
		const angle = Math.atan2(centerPosition.y - y, centerPosition.x - x)
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle),
		}
		enemies.push(new Enemy(x, y, radius, color, velocity))
	}, 1000)
}

// Arrays
const projectiles = []
const enemies = []

// ! ANIMATE FUNCTION IS HERE
let animationFrameId
function animate() {
	animationFrameId = requestAnimationFrame(animate)
	c.fillStyle = "rgba(20, 20, 20, 0.1)"
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.draw()
	projectiles.forEach((projectile, index) => {
		projectile.update()

		// remove projectiles from edges of screen
		if (
			projectile.x + projectile.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(index, 1)
			}, 0)
		}
	})
	enemies.forEach((enemy, index) => {
		enemy.update()

		// End Game
		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

		if (dist - (enemy.radius + player.radius) < 1) {
			cancelAnimationFrame(animationFrameId)
			// Alert to ask to reset game
			alert("Game Over , Restart?")
		}

		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
			// When projectiles touch enemies
			if (dist - (enemy.radius + projectile.radius) < 1) {
				if (enemy.radius - 10 > 10) {
					enemy.radius -= 10
					setTimeout(() => {
						projectiles.splice(projectileIndex, 1)
					}, 0)
				} else {
					setTimeout(() => {
						enemies.splice(index, 1)
						projectiles.splice(projectileIndex, 1)
					}, 0)
				}
			}
		})
	})
}
window.addEventListener("click", e => {
	// angles are in raidans (2pi or tau = 360 degrees)

	const angle = Math.atan2(
		e.clientY - centerPosition.y,
		e.clientX - centerPosition.x
	)
	const velocity = {
		x: Math.cos(angle) * 4,
		y: Math.sin(angle) * 4,
	}

	projectiles.push(
		new Projectile(centerPosition.x, centerPosition.y, 5, "white", {
			x: velocity.x,
			y: velocity.y,
		})
	)
})
animate()
spawnEnemeies()
