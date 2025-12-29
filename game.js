const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE = 48;
const GROUND_Y = canvas.height - 80;

// ================= ASSET =================
const skyImg = new Image();
skyImg.src = "assets/map/sky.png";

const groundImg = new Image();
groundImg.src = "assets/map/ground.png";

// PLAYER IMAGE
const playerImg = {
  idle: new Image(),
  run: new Image(),
  attack: new Image()
};
playerImg.idle.src = "assets/player/player_idle.png";
playerImg.run.src = "assets/player/player_run.png";
playerImg.attack.src = "assets/player/player_attack.png";

// ENEMY IMAGE
const enemyImg = {
  goblin: new Image(),
  wolf: new Image(),
  slime: new Image(),
  boss: new Image(),
  miniboss: new Image()
};
enemyImg.goblin.src = "assets/goblin.png";
enemyImg.wolf.src = "assets/wolf.png";
enemyImg.slime.src = "assets/slime.png";
enemyImg.boss.src = "assets/boss.png";
enemyImg.miniboss.src = "assets/mini-boss.png";

// ================= AUDIO =================
const bgm = new Audio("assets/backsound.mp3");
bgm.loop = true;
bgm.volume = 0.6;

const bossBgm = new Audio("assets/boss.mp3");
bossBgm.loop = true;
bossBgm.volume = 0.8;

const miniBossSfx = new Audio("assets/mini-boss.mp3");

const sfx = {
  punch: new Audio("assets/punch.mp3"),
  sword: new Audio("assets/sword.mp3"),
  heal: new Audio("assets/heal.mp3"),
  magic: new Audio("assets/magic.mp3")
};

// ================= INPUT =================
const keys = { left:false, right:false, jump:false };

document.getElementById("left").ontouchstart = () => keys.left = true;
document.getElementById("left").ontouchend = () => keys.left = false;
document.getElementById("right").ontouchstart = () => keys.right = true;
document.getElementById("right").ontouchend = () => keys.right = false;
document.getElementById("jump").ontouchstart = () => keys.jump = true;
document.getElementById("jump").ontouchend = () => keys.jump = false;
document.getElementById("attack").ontouchstart = attack;

// ================= PLAYER =================
const player = {
  x: 200,
  y: GROUND_Y - 64,
  w: 48,
  h: 64,
  speed: 4,
  velY: 0,
  onGround: false,
  state: "idle",
  hp: 100,
  mp: 50,
  gold: 0,
  hasSword: false,
  isAttacking: false
};

// ================= CAMERA =================
let cameraX = 0;

// ================= ENEMY =================
let enemies = [];
let lastSpawnX = 800;

// ================= BOSS =================
let boss = null;

// ================= LOGIC =================
function attack() {
  if (player.isAttacking) return;
  player.isAttacking = true;
  player.state = "attack";

  if (player.hasSword) {
    sfx.sword.play();
  } else {
    sfx.punch.play();
  }

  setTimeout(() => {
    player.isAttacking = false;
  }, 300);
}

function updatePlayer() {
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;

  if (keys.jump && player.onGround) {
    player.velY = -12;
    player.onGround = false;
  }

  player.velY += 0.6;
  player.y += player.velY;

  if (player.y + player.h >= GROUND_Y) {
    player.y = GROUND_Y - player.h;
    player.velY = 0;
    player.onGround = true;
  }

  if (player.isAttacking) player.state = "attack";
  else if (keys.left || keys.right) player.state = "run";
  else player.state = "idle";

  cameraX = player.x - canvas.width / 2;
  if (cameraX < 0) cameraX = 0;
}

function spawnEnemy() {
  const types = ["goblin","wolf","slime"];
  const type = types[Math.floor(Math.random()*types.length)];

  enemies.push({
    type,
    x: cameraX + canvas.width + 300,
    y: GROUND_Y - 48,
    w: 48,
    h: 48,
    hp: 30,
    maxHp: 30
  });
}

function updateEnemySpawn() {
  if (cameraX > lastSpawnX) {
    spawnEnemy();
    lastSpawnX += 500;
  }
}

// ================= DRAW =================
function drawSky() {
  ctx.drawImage(skyImg, -cameraX*0.3, 0, canvas.width*2, canvas.height);
}

function drawGround() {
  for (let i=-1;i<40;i++) {
    ctx.drawImage(
      groundImg,
      i*TILE - cameraX%TILE,
      GROUND_Y,
      TILE,
      TILE
    );
  }
}

function drawPlayer() {
  const img = playerImg[player.state];
  ctx.drawImage(img, player.x-cameraX, player.y, player.w, player.h);
}

function drawEnemies() {
  enemies.forEach(e=>{
    ctx.drawImage(enemyImg[e.type], e.x-cameraX, e.y, e.w, e.h);

    // HP bar kecil
    ctx.fillStyle="red";
    ctx.fillRect(e.x-cameraX, e.y-6, e.w*(e.hp/e.maxHp),4);
  });
}

function drawHUD() {
  ctx.fillStyle="white";
  ctx.font="14px Arial";
  ctx.fillText("HP: "+player.hp, 20, 25);
  ctx.fillText("MP: "+player.mp, 20, 45);
  ctx.fillText("Gold: "+player.gold, 20, 65);
}

// ================= GAME LOOP =================
function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawSky();
  drawGround();

  updatePlayer();
  updateEnemySpawn();

  drawEnemies();
  drawPlayer();
  drawHUD();

  requestAnimationFrame(gameLoop);
}

// ================= START =================
bgm.play();
gameLoop();
