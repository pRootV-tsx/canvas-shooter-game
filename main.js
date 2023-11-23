const canvas = document.getElementById("canvas")
const scoreEl = document.getElementById("scoreEl")
const bigScoreEl = document.getElementById("bigScoreEl")
const startGameBtn = document.getElementById("startGameBtn")
const modalEl = document.getElementById("modalEl")

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

const friction = 0.98
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		this.aplha = 1
	}

	draw() {
		c.save()
		c.globalAlpha = this.aplha
		c.beginPath()

		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
		c.restore()
	}

	update() {
		this.draw()
		this.velocity.x *= friction
		this.velocity.y *= friction
		this.x += this.velocity.x
		this.y += this.velocity.y
		this.aplha -= 0.01
	}
}

const centerPosition = {
	x: canvas.width / 2,
	y: canvas.height / 2,
}

// Create a new player object
let player = new Player(centerPosition.x, centerPosition.y, 0, "white") // Set initial size to 0

// Use GSAP to animate the player's size from 0 to the actual size
gsap.fromTo(
	player,
	{ radius: 0, color: "red" }, // Start with radius 0
	{ radius: 30, duration: 4, color: "white" } // Animate to radius 30 over 1 second
)

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

let projectiles = []
let enemies = []
let particles = []
let fillStyle = "rgba(20, 20, 20, 0.1)"
function init() {
	player = new Player(centerPosition.x, centerPosition.y, 10, "white")
	projectiles = []
	enemies = []
	particles = []
	score = 0

	scoreEl.innerHTML = score
	bigScoreEl.innerHTML = score
}

// Arrays

// ! ANIMATE FUNCTION IS HERE
let animationFrameId
let score = 0
function animate() {
	animationFrameId = requestAnimationFrame(animate)

	// updaet the window height and width in realtim
	function updateWindowSize() {
		sizes.width = window.innerWidth
		sizes.height = window.innerHeight

		canvas.width = sizes.width
		canvas.height = sizes.height

		// Move the player instance to the center of the viewport
		player.x = sizes.width / 2
		player.y = sizes.height / 2
	}

	window.addEventListener("resize", updateWindowSize)

	c.fillStyle = fillStyle
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.draw()
	particles.forEach((particle, index) => {
		if (particle.aplha <= 0) {
			particles.splice(index, 1)
		}
		particle.update()
	})
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

		console.log(score)
		if (dist - (enemy.radius + player.radius) < 1) {
			// convert the player color to red using gsap

			cancelAnimationFrame(animationFrameId)
			// Alert to ask to reset game
			modalEl.style.display = "flex"
			// update the score on modal
			bigScoreEl.innerHTML = score
		}

		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
			// When projectiles touch enemies
			if (dist - (enemy.radius + projectile.radius) < 1) {
				// For increase our score

				// Create particle explosions
				for (let i = 0; i < enemy.radius; i++) {
					particles.push(
						new Particle(
							projectile.x,
							projectile.y,
							Math.random() * 2,
							enemy.color,
							{
								x: (Math.random() - 0.5) * (Math.random() * 6),
								y: (Math.random() - 0.5) * (Math.random() * 6),
							}
						)
					)
				}
				if (enemy.radius - 10 > 5) {
					score += 100
					scoreEl.innerHTML = score
					gsap.to(enemy, { radius: enemy.radius - 10 })

					setTimeout(() => {
						projectiles.splice(projectileIndex, 1)
					}, 0)
				} else {
					// remove from scene altogether
					score += 250
					scoreEl.innerHTML = score
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

startGameBtn.addEventListener("click", () => {
	init()
	animate()
	spawnEnemeies()

	// and hide the start button
	modalEl.style.display = "none"
})
