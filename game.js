const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let gameState = 'playing'; // 'playing', 'gameOver', 'paused'

// Game objects
const plane = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 60,
    height: 40,
    speed: 5,
    maxSpeed: 8,
    acceleration: 0.5,
    deceleration: 0.3,
    velocityX: 0,
    velocityY: 0,
    health: 3,
    maxHealth: 5,
    powerUpTime: 0,
    isPoweredUp: false,
    bulletSpeed: 7,
    bulletSize: 10,
    bulletHeight: 10,
    fireRate: 0,
    maxFireRate: 10,
    engineGlow: 0,
    engineGlowDirection: 1,
    isExploding: false,
    explosionTime: 0
};

const bullets = [];
const targets = [];
const stars = [];
const powerUps = [];
const explosions = [];
let score = 0;
let level = 1;
let gameTime = 0;
let targetSpawnRate = 0.02;
let targetSpeed = 3;
let targetSize = 30;

// Create stars for background
function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 1
        });
    }
}

// Game state
const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.code); // Debug log
    
    // Handle WASD keys
    if (e.code === 'KeyW') keys.KeyW = true;
    if (e.code === 'KeyA') keys.KeyA = true;
    if (e.code === 'KeyS') keys.KeyS = true;
    if (e.code === 'KeyD') keys.KeyD = true;
    if (e.code === 'Space') keys.Space = true;
});

document.addEventListener('keyup', (e) => {
    // Handle WASD keys
    if (e.code === 'KeyW') keys.KeyW = false;
    if (e.code === 'KeyA') keys.KeyA = false;
    if (e.code === 'KeyS') keys.KeyS = false;
    if (e.code === 'KeyD') keys.KeyD = false;
    if (e.code === 'Space') keys.Space = false;
});

// Add pause button
const pauseButton = document.createElement('button');
pauseButton.textContent = 'Pause';
pauseButton.className = 'pause-button';
document.querySelector('.game-container').appendChild(pauseButton);

// Pause button event listener
pauseButton.addEventListener('click', () => {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseButton.textContent = 'Resume';
    } else if (gameState === 'paused') {
        gameState = 'playing';
        pauseButton.textContent = 'Pause';
    }
});

// Game functions
function shoot() {
    if (plane.fireRate <= 0) {
        if (plane.isPoweredUp) {
            // Triple shot when powered up
            bullets.push(
                {
                    x: plane.x + plane.width / 2,
                    y: plane.y,
                    width: plane.bulletSize,
                    height: plane.bulletHeight,
                    speed: plane.bulletSpeed,
                    color: '#00ffff',
                    foodType: 'hamburger'
                },
                {
                    x: plane.x + 10,
                    y: plane.y,
                    width: plane.bulletSize,
                    height: plane.bulletHeight,
                    speed: plane.bulletSpeed,
                    color: '#00ffff',
                    foodType: 'pizza'
                },
                {
                    x: plane.x + plane.width - 10,
                    y: plane.y,
                    width: plane.bulletSize,
                    height: plane.bulletHeight,
                    speed: plane.bulletSpeed,
                    color: '#00ffff',
                    foodType: 'hotdog'
                }
            );
        } else {
            // Normal shot - randomly choose food type
            const foodTypes = ['hamburger', 'pizza', 'hotdog'];
            const randomFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];
            
            bullets.push({
                x: plane.x + plane.width / 2,
                y: plane.y,
                width: plane.bulletSize,
                height: plane.bulletHeight,
                speed: plane.bulletSpeed,
                color: '#fff',
                foodType: randomFood
            });
        }
        plane.fireRate = plane.maxFireRate;
    }
}

function createTarget() {
    if (Math.random() < targetSpawnRate) {
        const size = targetSize;
        const x = Math.random() * (canvas.width - size);
        const y = -size;
        
        // Create different types of enemies
        const enemyType = Math.random();
        let color, health, speed;
        
        if (enemyType < 0.6) {
            // Regular enemy (60% chance)
            color = '#ff0000';
            health = 1;
            speed = targetSpeed;
        } else if (enemyType < 0.85) {
            // Fast enemy (25% chance)
            color = '#ff6600';
            health = 1;
            speed = targetSpeed * 2.0;
        } else {
            // Tank enemy (15% chance)
            color = '#990000';
            health = 3;
            speed = targetSpeed * 0.8;
        }
        
        // Determine if enemy is food-themed
        const isFood = Math.random() < 0.3; // 30% chance to be food
        const foodTypes = ['pizza', 'icecream', 'donut'];
        const foodType = isFood ? foodTypes[Math.floor(Math.random() * foodTypes.length)] : null;
        
        targets.push({
            x: x,
            y: y,
            width: size,
            height: size,
            size: size,
            color: color,
            health: health,
            speed: speed,
            isFood: isFood,
            foodType: foodType
        });
    }
}

function createPowerUp() {
    if (Math.random() < 0.005) {
        const powerUpType = Math.random();
        let color, effect;
        
        if (powerUpType < 0.5) {
            // Health power-up
            color = '#00ff00';
            effect = 'health';
        } else {
            // Weapon power-up
            color = '#00ffff';
            effect = 'weapon';
        }
        
        powerUps.push({
            x: Math.random() * (canvas.width - 20),
            y: 0,
            width: 20,
            height: 20,
            speed: 2,
            color: color,
            effect: effect
        });
    }
}

function createExplosion(x, y, size) {
    for (let i = 0; i < 10; i++) {
        explosions.push({
            x: x + size/2,
            y: y + size/2,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 3,
            speedY: (Math.random() - 0.5) * 3,
            life: 15,
            color: '#ff6600'
        });
    }
}

function updatePlane() {
    if (gameState !== 'playing') return;
    
    if (plane.isExploding) {
        plane.explosionTime--;
        
        // Add more explosion particles during the explosion, but less frequently
        if (plane.explosionTime % 10 === 0) {
            createPlaneExplosion();
        }
        
        // When explosion is complete, show game over
        if (plane.explosionTime <= 0) {
            gameState = 'gameOver';
        }
        return;
    }
    
    // Apply acceleration based on key presses
    if (keys.KeyA) {
        plane.velocityX -= plane.acceleration;
    } else if (keys.KeyD) {
        plane.velocityX += plane.acceleration;
    } else {
        // Apply deceleration when no keys are pressed
        if (plane.velocityX > 0) {
            plane.velocityX = Math.max(0, plane.velocityX - plane.deceleration);
        } else if (plane.velocityX < 0) {
            plane.velocityX = Math.min(0, plane.velocityX + plane.deceleration);
        }
    }
    
    if (keys.KeyW) {
        plane.velocityY -= plane.acceleration;
    } else if (keys.KeyS) {
        plane.velocityY += plane.acceleration;
    } else {
        // Apply deceleration when no keys are pressed
        if (plane.velocityY > 0) {
            plane.velocityY = Math.max(0, plane.velocityY - plane.deceleration);
        } else if (plane.velocityY < 0) {
            plane.velocityY = Math.min(0, plane.velocityY + plane.deceleration);
        }
    }
    
    // Limit velocity to max speed
    plane.velocityX = Math.max(-plane.maxSpeed, Math.min(plane.maxSpeed, plane.velocityX));
    plane.velocityY = Math.max(-plane.maxSpeed, Math.min(plane.maxSpeed, plane.velocityY));
    
    // Update position based on velocity
    plane.x += plane.velocityX;
    plane.y += plane.velocityY;
    
    // Keep plane within canvas bounds
    plane.x = Math.max(0, Math.min(canvas.width - plane.width, plane.x));
    plane.y = Math.max(0, Math.min(canvas.height - plane.height, plane.y));
    
    // If plane hits a boundary, stop velocity in that direction
    if (plane.x <= 0 || plane.x >= canvas.width - plane.width) {
        plane.velocityX = 0;
    }
    if (plane.y <= 0 || plane.y >= canvas.height - plane.height) {
        plane.velocityY = 0;
    }
    
    // Auto-shooting when space is held
    if (keys.Space) {
        shoot();
    }
    
    // Update fire rate
    if (plane.fireRate > 0) {
        plane.fireRate--;
    }
    
    // Update power-up timer
    if (plane.isPoweredUp) {
        plane.powerUpTime--;
        if (plane.powerUpTime <= 0) {
            plane.isPoweredUp = false;
        }
    }
    
    // Update engine glow animation
    plane.engineGlow += plane.engineGlowDirection * 0.05;
    if (plane.engineGlow > 1) {
        plane.engineGlow = 1;
        plane.engineGlowDirection = -1;
    } else if (plane.engineGlow < 0.3) {
        plane.engineGlow = 0.3;
        plane.engineGlowDirection = 1;
    }
}

function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

function updateTargets() {
    for (let i = targets.length - 1; i >= 0; i--) {
        // Add slight horizontal movement to targets for more interesting patterns
        targets[i].y += targets[i].speed;
        
        // Add a slight sine wave movement to targets
        if (targets[i].originalX === undefined) {
            targets[i].originalX = targets[i].x;
        }
        targets[i].x = targets[i].originalX + Math.sin(targets[i].y * 0.02) * 20;
        
        if (targets[i].y > canvas.height) {
            targets.splice(i, 1);
        }
    }
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += powerUps[i].speed;
        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].x += explosions[i].speedX;
        explosions[i].y += explosions[i].speedY;
        explosions[i].life--;
        if (explosions[i].life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Check bullet collisions with targets
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = targets.length - 1; j >= 0; j--) {
            if (isColliding(bullets[i], targets[j])) {
                bullets.splice(i, 1);
                targets[j].health--;
                
                if (targets[j].health <= 0) {
                    createExplosion(targets[j].x, targets[j].y, targets[j].size);
                    // Score based on enemy type
                    if (targets[j].color === '#ff6600') {
                        score += 20; // Fast enemy
                    } else if (targets[j].color === '#990000') {
                        score += 30; // Tank enemy
                    } else {
                        score += 10; // Regular enemy
                    }
                    
                    // Bonus points for food enemies
                    if (targets[j].isFood) {
                        score += 5;
                    }
                    
                    scoreElement.textContent = score;
                    targets.splice(j, 1);
                }
                break;
            }
        }
    }
    
    // Check plane collisions with targets
    for (let i = targets.length - 1; i >= 0; i--) {
        if (isColliding(plane, targets[i])) {
            createExplosion(targets[i].x, targets[i].y, targets[i].size);
            targets.splice(i, 1);
            plane.health--;
            
            if (plane.health <= 0) {
                console.log("Plane health reached zero, triggering explosion"); // Debug log
                plane.isExploding = true;
                plane.explosionTime = 30; // Reduced from 60 to 30 (half a second at 60fps)
                createPlaneExplosion();
            }
        }
    }
    
    // Check plane collisions with power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (isColliding(plane, powerUps[i])) {
            if (powerUps[i].effect === 'health') {
                plane.health = Math.min(plane.health + 1, plane.maxHealth);
            } else if (powerUps[i].effect === 'weapon') {
                plane.isPoweredUp = true;
                plane.powerUpTime = 300; // 5 seconds at 60fps
            }
            powerUps.splice(i, 1);
        }
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateGameDifficulty() {
    gameTime++;
    
    // Increase difficulty every 15 seconds (reduced from 20)
    if (gameTime % 900 === 0) {
        level++;
        
        // More aggressive speed increases
        targetSpawnRate += 0.015; // Increased from 0.01
        targetSpeed += 1.5; // Increased from 1.0
        plane.maxSpeed += 0.4; // Increased from 0.3
        plane.acceleration += 0.1; // Increase acceleration with level
        
        // Show level up message with more visual impact
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${level}!`, canvas.width/2, canvas.height/2);
        
        // Add a visual effect for level up - reduced number of explosions
        for (let i = 0; i < 10; i++) { // Reduced from 20
            explosions.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 6 + 3, // Reduced from 10+5
                speedX: (Math.random() - 0.5) * 6, // Reduced from 10
                speedY: (Math.random() - 0.5) * 6, // Reduced from 10
                life: 20, // Reduced from 30
                color: '#00ffff'
            });
        }
        
        ctx.textAlign = 'left';
    }
}

function drawBackground() {
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#FFFFFF';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw level indicator
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Level: ' + level, canvas.width - 150, 50);
}

function drawHealth() {
    const heartSize = 25;
    const heartSpacing = 30;
    const heartX = 20; // Position hearts on the left side
    
    for (let i = 0; i < plane.maxHealth; i++) {
        const heartY = 30 + (i * heartSpacing);
        
        // Draw heart outline
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(heartX + heartSize/2, heartY + heartSize/4);
        ctx.bezierCurveTo(
            heartX + heartSize/2, heartY, 
            heartX + heartSize, heartY, 
            heartX + heartSize, heartY + heartSize/4
        );
        ctx.bezierCurveTo(
            heartX + heartSize, heartY + heartSize/2, 
            heartX + heartSize/2, heartY + heartSize, 
            heartX + heartSize/2, heartY + heartSize
        );
        ctx.bezierCurveTo(
            heartX + heartSize/2, heartY + heartSize, 
            heartX, heartY + heartSize/2, 
            heartX, heartY + heartSize/4
        );
        ctx.bezierCurveTo(
            heartX, heartY, 
            heartX + heartSize/2, heartY, 
            heartX + heartSize/2, heartY + heartSize/4
        );
        ctx.stroke();
        
        // Fill heart if health is available
        if (i < plane.health) {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.moveTo(heartX + heartSize/2, heartY + heartSize/4);
            ctx.bezierCurveTo(
                heartX + heartSize/2, heartY, 
                heartX + heartSize, heartY, 
                heartX + heartSize, heartY + heartSize/4
            );
            ctx.bezierCurveTo(
                heartX + heartSize, heartY + heartSize/2, 
                heartX + heartSize/2, heartY + heartSize, 
                heartX + heartSize/2, heartY + heartSize
            );
            ctx.bezierCurveTo(
                heartX + heartSize/2, heartY + heartSize, 
                heartX, heartY + heartSize/2, 
                heartX, heartY + heartSize/4
            );
            ctx.bezierCurveTo(
                heartX, heartY, 
                heartX + heartSize/2, heartY, 
                heartX + heartSize/2, heartY + heartSize/4
            );
            ctx.fill();
            
            // Add glow effect
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

function drawPlane() {
    // Don't draw the plane if it's exploding
    if (plane.isExploding) return;
    
    // Draw engine glow with pulsing effect
    const glowSize = 20 + plane.engineGlow * 15;
    const gradient = ctx.createRadialGradient(
        plane.x + plane.width/2, plane.y + plane.height + glowSize/2, 0,
        plane.x + plane.width/2, plane.y + plane.height + glowSize/2, glowSize
    );
    
    if (plane.isPoweredUp) {
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
    } else {
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(plane.x + plane.width/2, plane.y + plane.height + glowSize/2, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Add engine exhaust particles
    for (let i = 0; i < 5; i++) {
        const particleSize = Math.random() * 3 + 1;
        const particleX = plane.x + plane.width/2 + (Math.random() - 0.5) * 10;
        const particleY = plane.y + plane.height + Math.random() * 10;
        
        ctx.fillStyle = plane.isPoweredUp ? 'rgba(0, 255, 255, 0.7)' : 'rgba(255, 200, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw plane body with metallic effect
    const planeColor = plane.isPoweredUp ? '#00ffff' : '#00ff00';
    const planeShadow = plane.isPoweredUp ? '#0088aa' : '#008800';
    
    // Main body with gradient
    const bodyGradient = ctx.createLinearGradient(
        plane.x, plane.y, plane.x + plane.width, plane.y + plane.height
    );
    bodyGradient.addColorStop(0, planeColor);
    bodyGradient.addColorStop(0.5, planeShadow);
    bodyGradient.addColorStop(1, planeColor);
    
    ctx.fillStyle = bodyGradient;
    
    // Sleek, aerodynamic body
    ctx.beginPath();
    ctx.moveTo(plane.x + plane.width/2, plane.y);
    ctx.lineTo(plane.x + plane.width - 5, plane.y + plane.height/3);
    ctx.lineTo(plane.x + plane.width - 10, plane.y + plane.height - 5);
    ctx.lineTo(plane.x + 10, plane.y + plane.height - 5);
    ctx.lineTo(plane.x + 5, plane.y + plane.height/3);
    ctx.closePath();
    ctx.fill();
    
    // Add metallic highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plane.x + plane.width/2, plane.y + 5);
    ctx.lineTo(plane.x + plane.width - 8, plane.y + plane.height/3 + 5);
    ctx.lineTo(plane.x + plane.width - 12, plane.y + plane.height - 8);
    ctx.stroke();
    
    // Cockpit with glass effect
    const cockpitGradient = ctx.createRadialGradient(
        plane.x + plane.width/2, plane.y + plane.height/3, 0,
        plane.x + plane.width/2, plane.y + plane.height/3, 10
    );
    cockpitGradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
    cockpitGradient.addColorStop(1, 'rgba(50, 150, 255, 0.5)');
    
    ctx.fillStyle = cockpitGradient;
    ctx.beginPath();
    ctx.ellipse(plane.x + plane.width/2, plane.y + plane.height/3, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cockpit frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(plane.x + plane.width/2, plane.y + plane.height/3, 10, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Wings with metallic effect
    const wingGradient = ctx.createLinearGradient(
        plane.x - 15, plane.y + plane.height/2, plane.x + plane.width + 15, plane.y + plane.height/2
    );
    wingGradient.addColorStop(0, planeShadow);
    wingGradient.addColorStop(0.5, planeColor);
    wingGradient.addColorStop(1, planeShadow);
    
    ctx.fillStyle = wingGradient;
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(plane.x - 5, plane.y + plane.height/2 - 5);
    ctx.lineTo(plane.x - 20, plane.y + plane.height/2 - 15);
    ctx.lineTo(plane.x - 15, plane.y + plane.height/2 + 5);
    ctx.lineTo(plane.x, plane.y + plane.height/2 + 5);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(plane.x + plane.width - 5, plane.y + plane.height/2 - 5);
    ctx.lineTo(plane.x + plane.width + 15, plane.y + plane.height/2 - 15);
    ctx.lineTo(plane.x + plane.width + 10, plane.y + plane.height/2 + 5);
    ctx.lineTo(plane.x + plane.width, plane.y + plane.height/2 + 5);
    ctx.closePath();
    ctx.fill();
    
    // Wing details
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    
    // Left wing details
    ctx.beginPath();
    ctx.moveTo(plane.x - 5, plane.y + plane.height/2 - 5);
    ctx.lineTo(plane.x - 20, plane.y + plane.height/2 - 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(plane.x - 15, plane.y + plane.height/2 + 5);
    ctx.lineTo(plane.x - 20, plane.y + plane.height/2 - 15);
    ctx.stroke();
    
    // Right wing details
    ctx.beginPath();
    ctx.moveTo(plane.x + plane.width - 5, plane.y + plane.height/2 - 5);
    ctx.lineTo(plane.x + plane.width + 15, plane.y + plane.height/2 - 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(plane.x + plane.width + 10, plane.y + plane.height/2 + 5);
    ctx.lineTo(plane.x + plane.width + 15, plane.y + plane.height/2 - 15);
    ctx.stroke();
    
    // Add weapon glow when powered up
    if (plane.isPoweredUp) {
        const weaponGlow = ctx.createRadialGradient(
            plane.x + plane.width/2, plane.y, 0,
            plane.x + plane.width/2, plane.y, 15
        );
        weaponGlow.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
        weaponGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = weaponGlow;
        ctx.beginPath();
        ctx.arc(plane.x + plane.width/2, plane.y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawBullets() {
    bullets.forEach(bullet => {
        if (bullet.foodType) {
            // Draw food projectile based on type
            switch(bullet.foodType) {
                case 'hamburger':
                    drawHamburger(bullet);
                    break;
                case 'pizza':
                    drawPizza(bullet);
                    break;
                case 'hotdog':
                    drawHotdog(bullet);
                    break;
                default:
                    // Fallback to regular bullet
                    ctx.fillStyle = bullet.color;
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
        } else {
            // Fallback to regular bullet
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
}

// Helper functions to draw different food types
function drawHamburger(bullet) {
    // Bottom bun
    ctx.fillStyle = '#f4a460'; // Sandy brown
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height*0.8, bullet.width/2, bullet.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Patty
    ctx.fillStyle = '#8B4513'; // Saddle brown
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height*0.5, bullet.width/2, bullet.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Lettuce
    ctx.fillStyle = '#90EE90'; // Light green
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height*0.4, bullet.width/2, bullet.height/6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tomato
    ctx.fillStyle = '#FF6347'; // Tomato red
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height*0.3, bullet.width/2, bullet.height/6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Top bun
    ctx.fillStyle = '#f4a460'; // Sandy brown
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height*0.2, bullet.width/2, bullet.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sesame seeds to top bun
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
            bullet.x + bullet.width/2 + (Math.random() - 0.5) * bullet.width/2, 
            bullet.y + bullet.height*0.2 + (Math.random() - 0.5) * bullet.height/4, 
            1, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawPizza(bullet) {
    // Pizza base
    ctx.fillStyle = '#FFD700'; // Gold for cheese
    ctx.beginPath();
    ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add pepperoni
    ctx.fillStyle = '#FF6347'; // Tomato red for pepperoni
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
            bullet.x + bullet.width/2 + (Math.random() - 0.5) * bullet.width/2, 
            bullet.y + bullet.height/2 + (Math.random() - 0.5) * bullet.height/2, 
            bullet.width/6, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawHotdog(bullet) {
    // Hot dog bun
    ctx.fillStyle = '#f4a460'; // Sandy brown
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, bullet.height/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hot dog
    ctx.fillStyle = '#FF6347'; // Tomato red
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/3, bullet.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mustard
    ctx.fillStyle = '#FFFF00'; // Yellow
    ctx.beginPath();
    ctx.ellipse(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/4, bullet.height/6, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawTargets() {
    targets.forEach(target => {
        // Create a more interesting enemy shape
        ctx.save();
        
        // Add glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        
        if (target.isFood) {
            // Draw food enemy based on type
            switch(target.foodType) {
                case 'pizza':
                    drawPizzaEnemy(target);
                    break;
                case 'icecream':
                    drawIceCreamEnemy(target);
                    break;
                case 'donut':
                    drawDonutEnemy(target);
                    break;
                default:
                    // Fallback to regular enemy
                    drawRegularEnemy(target);
            }
        } else {
            // Draw regular enemy
            drawRegularEnemy(target);
        }
        
        ctx.restore();
    });
}

// Helper functions to draw different enemy types
function drawRegularEnemy(target) {
    ctx.fillStyle = target.color;
    
    // Draw a more complex shape - a hexagonal enemy with details
    ctx.beginPath();
    ctx.moveTo(target.x + target.size/2, target.y);
    ctx.lineTo(target.x + target.size, target.y + target.size/3);
    ctx.lineTo(target.x + target.size, target.y + target.size*2/3);
    ctx.lineTo(target.x + target.size/2, target.y + target.size);
    ctx.lineTo(target.x, target.y + target.size*2/3);
    ctx.lineTo(target.x, target.y + target.size/3);
    ctx.closePath();
    ctx.fill();
    
    // Add inner details
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.moveTo(target.x + target.size/2, target.y + target.size/4);
    ctx.lineTo(target.x + target.size*3/4, target.y + target.size/2);
    ctx.lineTo(target.x + target.size/2, target.y + target.size*3/4);
    ctx.lineTo(target.x + target.size/4, target.y + target.size/2);
    ctx.closePath();
    ctx.fill();
    
    // Add "eye" in the center
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(target.x + target.size/2, target.y + target.size/2, target.size/6, 0, Math.PI * 2);
    ctx.fill();
    
    // Add pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(target.x + target.size/2, target.y + target.size/2, target.size/12, 0, Math.PI * 2);
    ctx.fill();
}

function drawPizzaEnemy(target) {
    // Draw a pizza slice enemy
    ctx.fillStyle = target.color;
    
    // Draw a pizza slice
    ctx.beginPath();
    ctx.moveTo(target.x + target.size/2, target.y + target.size/2);
    ctx.lineTo(target.x + target.size, target.y);
    ctx.lineTo(target.x + target.size, target.y + target.size);
    ctx.closePath();
    ctx.fill();
    
    // Add toppings
    ctx.fillStyle = '#FF6347'; // Tomato red for pepperoni
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
            target.x + target.size/2 + (Math.random() - 0.5) * target.size/2, 
            target.y + target.size/2 + (Math.random() - 0.5) * target.size/2, 
            target.size/8, 0, Math.PI * 2
        );
        ctx.fill();
    }
    
    // Add cheese texture
    ctx.fillStyle = '#FFD700'; // Gold for cheese
    ctx.beginPath();
    ctx.arc(target.x + target.size/2, target.y + target.size/2, target.size/4, 0, Math.PI * 2);
    ctx.fill();
}

function drawIceCreamEnemy(target) {
    // Draw an ice cream cone enemy
    ctx.fillStyle = target.color;
    
    // Draw cone
    ctx.beginPath();
    ctx.moveTo(target.x + target.size/2, target.y + target.size);
    ctx.lineTo(target.x + target.size/4, target.y + target.size/2);
    ctx.lineTo(target.x + target.size*3/4, target.y + target.size/2);
    ctx.closePath();
    ctx.fill();
    
    // Draw ice cream scoop
    ctx.fillStyle = '#FFB6C1'; // Light pink
    ctx.beginPath();
    ctx.arc(target.x + target.size/2, target.y + target.size/3, target.size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sprinkles
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
            target.x + target.size/2 + (Math.random() - 0.5) * target.size/2, 
            target.y + target.size/3 + (Math.random() - 0.5) * target.size/3, 
            1, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawDonutEnemy(target) {
    // Draw a donut enemy
    ctx.fillStyle = target.color;
    
    // Draw donut
    ctx.beginPath();
    ctx.arc(target.x + target.size/2, target.y + target.size/2, target.size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw donut hole
    ctx.fillStyle = '#000033'; // Dark blue for background
    ctx.beginPath();
    ctx.arc(target.x + target.size/2, target.y + target.size/2, target.size/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sprinkles
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(
            target.x + target.size/2 + Math.cos(i * Math.PI / 3) * target.size/3, 
            target.y + target.size/2 + Math.sin(i * Math.PI / 3) * target.size/3, 
            2, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon based on power-up type
        ctx.fillStyle = '#FFFFFF';
        if (powerUp.effect === 'health') {
            // Plus sign for health
            ctx.fillRect(powerUp.x + powerUp.width/2 - 2, powerUp.y + 5, 4, 10);
            ctx.fillRect(powerUp.x + 5, powerUp.y + powerUp.height/2 - 2, 10, 4);
        } else {
            // Star for weapon
            ctx.beginPath();
            ctx.moveTo(powerUp.x + powerUp.width/2, powerUp.y + 5);
            ctx.lineTo(powerUp.x + powerUp.width - 5, powerUp.y + powerUp.height - 5);
            ctx.lineTo(powerUp.x + 5, powerUp.y + powerUp.height/2);
            ctx.lineTo(powerUp.x + powerUp.width - 5, powerUp.y + 5);
            ctx.lineTo(powerUp.x + 5, powerUp.y + powerUp.height - 5);
            ctx.closePath();
            ctx.fill();
        }
    });
}

function drawExplosions() {
    explosions.forEach(explosion => {
        // Make explosions more contained with lower opacity
        ctx.fillStyle = explosion.color;
        ctx.globalAlpha = 0.6; // Reduced from 0.8
        
        // Draw the explosion particle
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a more contained glow effect
        ctx.shadowColor = explosion.color;
        ctx.shadowBlur = 8; // Reduced from 15
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.globalAlpha = 1;
    });
}

function drawGameOver() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game over text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 50);
    
    // Score text
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    
    // Play again button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = canvas.width/2 - buttonWidth/2;
    const buttonY = canvas.height/2 + 80;
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Play Again', canvas.width/2, buttonY + 35);
    
    // Reset text alignment
    ctx.textAlign = 'left';
}

function drawPauseScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pause text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width/2, canvas.height/2 - 50);
    
    // Instructions
    ctx.font = '24px Arial';
    ctx.fillText('Press Resume to continue', canvas.width/2, canvas.height/2 + 20);
    
    // Reset text alignment
    ctx.textAlign = 'left';
}

// Handle mouse clicks for game over screen
canvas.addEventListener('click', (e) => {
    if (gameState === 'gameOver') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is on Play Again button
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = canvas.width/2 - buttonWidth/2;
        const buttonY = canvas.height/2 + 80;
        
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            resetGame();
        }
    }
});

function resetGame() {
    // Reset game state
    gameState = 'playing';
    
    // Reset plane
    plane.x = canvas.width / 2;
    plane.y = canvas.height - 100;
    plane.velocityX = 0;
    plane.velocityY = 0;
    plane.health = 3;
    plane.isPoweredUp = false;
    plane.powerUpTime = 0;
    plane.isExploding = false;
    plane.explosionTime = 0;
    plane.maxSpeed = 8;
    plane.acceleration = 0.5;
    
    // Reset game variables
    bullets.length = 0;
    targets.length = 0;
    powerUps.length = 0;
    explosions.length = 0;
    score = 0;
    level = 1;
    gameTime = 0;
    targetSpawnRate = 0.02;
    targetSpeed = 3;
    
    // Update score display
    scoreElement.textContent = score;
}

function createPlaneExplosion() {
    console.log("Creating plane explosion!"); // Debug log
    
    // Create a central explosion with fewer particles
    for (let i = 0; i < 15; i++) { // Reduced from 20
        explosions.push({
            x: plane.x + plane.width/2,
            y: plane.y + plane.height/2,
            size: Math.random() * 8 + 4, // Reduced from 12+6
            speedX: (Math.random() - 0.5) * 6, // Reduced from 10
            speedY: (Math.random() - 0.5) * 6, // Reduced from 10
            life: 20, // Reduced from 30
            color: '#ff6600'
        });
    }
    
    // Create debris pieces with fewer particles
    for (let i = 0; i < 10; i++) { // Reduced from 15
        explosions.push({
            x: plane.x + Math.random() * plane.width,
            y: plane.y + Math.random() * plane.height,
            size: Math.random() * 5 + 3, // Reduced from 8+4
            speedX: (Math.random() - 0.5) * 8, // Reduced from 12
            speedY: (Math.random() - 0.5) * 8, // Reduced from 12
            life: 30, // Reduced from 45
            color: plane.isPoweredUp ? '#00ffff' : '#00ff00'
        });
    }
    
    // Create engine explosion with fewer particles
    for (let i = 0; i < 8; i++) { // Reduced from 10
        explosions.push({
            x: plane.x + plane.width/2,
            y: plane.y + plane.height,
            size: Math.random() * 6 + 3, // Reduced from 10+5
            speedX: (Math.random() - 0.5) * 5, // Reduced from 8
            speedY: Math.random() * 6 + 3, // Reduced from 10+5
            life: 20, // Reduced from 25
            color: '#ffff00'
        });
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'playing') {
        updateGameDifficulty();
        updateStars();
        updatePlane();
        updateBullets();
        updateTargets();
        updatePowerUps();
        updateExplosions();
        checkCollisions();
        
        createTarget();
        createPowerUp();
    } else if (gameState === 'paused') {
        updateStars(); // Keep stars moving even when paused
    }
    
    drawBackground();
    drawPlane();
    drawBullets();
    drawTargets();
    drawPowerUps();
    drawExplosions();
    drawHealth();
    
    if (gameState === 'gameOver') {
        drawGameOver();
    } else if (gameState === 'paused') {
        drawPauseScreen();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize stars and start the game
createStars();
gameLoop(); 