const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game objects
const plane = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 30,
    speed: 5,
    health: 3
};

const bullets = [];
const targets = [];
const stars = [];
let score = 0;

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
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code in keys) {
        keys[e.code] = true;
        if (e.code === 'Space') {
            shoot();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code in keys) {
        keys[e.code] = false;
    }
});

// Game functions
function shoot() {
    bullets.push({
        x: plane.x + plane.width / 2,
        y: plane.y,
        width: 4,
        height: 10,
        speed: 7
    });
}

function createTarget() {
    if (Math.random() < 0.02) {
        targets.push({
            x: Math.random() * (canvas.width - 30),
            y: 0,
            width: 30,
            height: 30,
            speed: 2
        });
    }
}

function updatePlane() {
    if (keys.ArrowLeft && plane.x > 0) plane.x -= plane.speed;
    if (keys.ArrowRight && plane.x < canvas.width - plane.width) plane.x += plane.speed;
    if (keys.ArrowUp && plane.y > 0) plane.y -= plane.speed;
    if (keys.ArrowDown && plane.y < canvas.height - plane.height) plane.y += plane.speed;
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

function checkCollisions() {
    // Check bullet-target collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = targets.length - 1; j >= 0; j--) {
            if (isColliding(bullets[i], targets[j])) {
                bullets.splice(i, 1);
                targets.splice(j, 1);
                score += 10;
                scoreElement.textContent = score;
                break;
            }
        }
    }

    // Check plane-target collisions
    for (let i = targets.length - 1; i >= 0; i--) {
        if (isColliding(plane, targets[i])) {
            targets.splice(i, 1);
            plane.health--;
            if (plane.health <= 0) {
                alert('Game Over! Your score: ' + score);
                location.reload();
            }
        }
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
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
}

function drawHealth() {
    const heartSize = 20;
    const spacing = 30;
    const startX = canvas.width - 150;
    const startY = 20;

    for (let i = 0; i < plane.health; i++) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(startX + i * spacing, startY);
        ctx.bezierCurveTo(
            startX + i * spacing - heartSize/2, startY - heartSize/2,
            startX + i * spacing - heartSize, startY + heartSize/3,
            startX + i * spacing, startY + heartSize
        );
        ctx.bezierCurveTo(
            startX + i * spacing + heartSize, startY + heartSize/3,
            startX + i * spacing + heartSize/2, startY - heartSize/2,
            startX + i * spacing, startY
        );
        ctx.fill();
    }
}

function drawPlane() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(plane.x, plane.y, plane.width, plane.height);
}

function drawBullets() {
    ctx.fillStyle = '#fff';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawTargets() {
    ctx.fillStyle = '#ff0000';
    targets.forEach(target => {
        ctx.fillRect(target.x, target.y, target.width, target.height);
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    updateStars();
    updatePlane();
    updateBullets();
    updateTargets();
    checkCollisions();
    createTarget();
    
    drawPlane();
    drawBullets();
    drawTargets();
    drawHealth();
    
    requestAnimationFrame(gameLoop);
}

// Initialize stars and start the game
createStars();
gameLoop(); 