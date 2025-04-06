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
    health: 3,
    maxHealth: 5,
    powerUpTime: 0,
    isPoweredUp: false,
    bulletSpeed: 7,
    bulletSize: 4,
    bulletHeight: 10,
    fireRate: 0,
    maxFireRate: 10,
    engineGlow: 0,
    engineGlowDirection: 1
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
let targetSpeed = 2;
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
                    color: '#00ffff'
                },
                {
                    x: plane.x + 10,
                    y: plane.y,
                    width: plane.bulletSize,
                    height: plane.bulletHeight,
                    speed: plane.bulletSpeed,
                    color: '#00ffff'
                },
                {
                    x: plane.x + plane.width - 10,
                    y: plane.y,
                    width: plane.bulletSize,
                    height: plane.bulletHeight,
                    speed: plane.bulletSpeed,
                    color: '#00ffff'
                }
            );
        } else {
            // Normal shot
            bullets.push({
                x: plane.x + plane.width / 2,
                y: plane.y,
                width: plane.bulletSize,
                height: plane.bulletHeight,
                speed: plane.bulletSpeed,
                color: '#fff'
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
            speed = targetSpeed * 1.5;
        } else {
            // Tank enemy (15% chance)
            color = '#990000';
            health = 3;
            speed = targetSpeed * 0.7;
        }
        
        targets.push({
            x: x,
            y: y,
            width: size,
            height: size,
            size: size,
            color: color,
            health: health,
            speed: speed
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
            size: Math.random() * 5 + 2,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            life: 20,
            color: '#ff6600'
        });
    }
}

function updatePlane() {
    if (gameState !== 'playing') return;
    
    if (keys.KeyA && plane.x > 0) plane.x -= plane.speed;
    if (keys.KeyD && plane.x < canvas.width - plane.width) plane.x += plane.speed;
    if (keys.KeyW && plane.y > 0) plane.y -= plane.speed;
    if (keys.KeyS && plane.y < canvas.height - plane.height) plane.y += plane.speed;
    
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
        targets[i].y += targets[i].speed;
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
                gameState = 'gameOver';
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
    
    // Increase difficulty every 30 seconds
    if (gameTime % 1800 === 0) {
        level++;
        targetSpawnRate += 0.005;
        targetSpeed += 0.5;
        plane.speed += 0.2; // Increase player speed too
        
        // Show level up message
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${level}!`, canvas.width/2, canvas.height/2);
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
    // Draw engine glow
    const glowSize = 15 + plane.engineGlow * 10;
    const gradient = ctx.createRadialGradient(
        plane.x + plane.width/2, plane.y + plane.height + glowSize/2, 0,
        plane.x + plane.width/2, plane.y + plane.height + glowSize/2, glowSize
    );
    
    if (plane.isPoweredUp) {
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    } else {
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(plane.x + plane.width/2, plane.y + plane.height + glowSize/2, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw plane body
    ctx.fillStyle = plane.isPoweredUp ? '#00ffff' : '#00ff00';
    
    // Main body
    ctx.beginPath();
    ctx.moveTo(plane.x + plane.width/2, plane.y);
    ctx.lineTo(plane.x + plane.width, plane.y + plane.height/2);
    ctx.lineTo(plane.x + plane.width - 10, plane.y + plane.height);
    ctx.lineTo(plane.x + 10, plane.y + plane.height);
    ctx.lineTo(plane.x, plane.y + plane.height/2);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.ellipse(plane.x + plane.width/2, plane.y + plane.height/3, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.fillStyle = plane.isPoweredUp ? '#00ccff' : '#00cc00';
    ctx.fillRect(plane.x - 5, plane.y + plane.height/2 - 5, 10, 10);
    ctx.fillRect(plane.x + plane.width - 5, plane.y + plane.height/2 - 5, 10, 10);
    
    // Wing details
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plane.x - 5, plane.y + plane.height/2 - 5);
    ctx.lineTo(plane.x - 15, plane.y + plane.height/2 - 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(plane.x + plane.width - 5, plane.y + plane.height/2 - 5);
    ctx.lineTo(plane.x + plane.width + 5, plane.y + plane.height/2 - 15);
    ctx.stroke();
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawTargets() {
    targets.forEach(target => {
        // Create a more interesting enemy shape
        ctx.save();
        
        // Add glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        
        // Draw enemy body
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
        
        ctx.restore();
    });
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
        ctx.fillStyle = explosion.color;
        ctx.globalAlpha = explosion.life / 20;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
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
    plane.health = 3;
    plane.isPoweredUp = false;
    plane.powerUpTime = 0;
    
    // Reset game variables
    bullets.length = 0;
    targets.length = 0;
    powerUps.length = 0;
    explosions.length = 0;
    score = 0;
    level = 1;
    gameTime = 0;
    targetSpawnRate = 0.02;
    targetSpeed = 2;
    
    // Update score display
    scoreElement.textContent = score;
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