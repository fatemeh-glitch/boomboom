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
    speed: 5
};

const bullets = [];
const targets = [];
let score = 0;

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
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
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
    
    updatePlane();
    updateBullets();
    updateTargets();
    checkCollisions();
    createTarget();
    
    drawPlane();
    drawBullets();
    drawTargets();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 