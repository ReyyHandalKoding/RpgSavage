const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ================== BASE RESOLUTION ================== */
const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;
let scale = 1;

function resizeCanvas() {
  const scaleX = window.innerWidth / BASE_WIDTH;
  const scaleY = window.innerHeight / BASE_HEIGHT;
  scale = Math.min(scaleX, scaleY);

  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;

  canvas.style.width = BASE_WIDTH * scale + "px";
  canvas.style.height = BASE_HEIGHT * scale + "px";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ================== WORLD ================== */
const TILE = 64;
const GROUND_Y = BASE_HEIGHT - TILE * 2;

/* ================== ASSET ================== */
const skyImg = new Image();
skyImg.src = "assets/map/sky.png";

const groundImg = new Image();
groundImg.src = "assets/map/ground.png";

/* PLAYER */
const playerImg = {
  idle: new Image(),
  run: new Image(),
  attack: new Image()
};
playerImg.idle.src = "assets/player/player_idle.png";
playerImg.run.src = "assets/player/player_run.png";
playerImg.attack.src = "assets/player/player_attack.png";

/* ENEMY */
const enemyImg = {
  slime: new Image(),
  goblin: new Image(),
  wolf: new Image(),
  "mini-boss": new Image(),
  boss: new Image()
};
enemyImg.slime.src = "assets/slime.png";
enemyImg.goblin.src = "assets/goblin.png";
enemyImg.wolf.src = "assets/wolf.png";
enemyImg["mini-boss"].src = "assets/mini-boss.png";
enemyImg.boss.src = "assets/boss.png";

/* ================== AUDIO ================== */
const bgm = new Audio("assets/backsound.mp3");
bgm.loop = true;
bgm.volume = 0.5;
bgm.play();

const sfx = {
  punch: new Audio("assets/punch.mp3"),
  sword: new Audio("assets/sword.mp3")
};

/* ================== INPUT ================== */
const keys = { left:false, right:false, jump:false };

left.ontouchstart = () => keys.left = true;
left.ontouchend   = () => keys.left = false;
right.ontouchstart= () => keys.right = true;
right.ontouchend  = () => keys.right = false;
jump.ontouchstart = () => keys.jump = true;
jump.ontouchend   = () => keys.jump = false;
attack.ontouchstart = doAttack;

/* ================== PLAYER ================== */
const player = {
  x: 200,
  y: GROUND_Y - 64,
  w: 48,
  h: 64,
  speed: 4,
  velY: 0,
  onGround: false,
  state: "idle",
  facing: "right",
  isAttacking: false,
  attackBox: null
};

/* ================== CAMERA ================== */
let cameraX = 0;

/* ================== ENEMY ================== */
let enemies = [];

function createEnemy(type, x) {
  const cfg = {
    slime:     { native:null, symmetric:true },
    goblin:    { native:"left", symmetric:false },
    wolf:      { native:"left", symmetric:false },
    "mini-boss": { native:"right", symmetric:false },
    boss:      { native:null, symmetric:true }
  };

  return {
    type,
    x,
    y: GROUND_Y - 48,
    w: 48,
    h: 48,
    hp: 30,
    maxHp: 30,
    facing: cfg[type].native || "left",
    nativeFacing: cfg[type].native,
    symmetric: cfg[type].symmetric
  };
}

enemies.push(createEnemy("goblin", 700));
enemies.push(createEnemy("wolf", 900));
enemies.push(createEnemy("slime", 1100));

/* ================== PLAYER LOGIC ================== */
function doAttack() {
  if (player.isAttacking) return;

  player.isAttacking = true;
  player.state = "attack";

  sfx.punch.currentTime = 0;
  sfx.punch.play();

  const range = 40;
  player.attackBox = {
    x: player.facing === "right"
      ? player.x + player.w
      : player.x - range,
    y: player.y + 10,
    w: range,
    h: player.h - 20
  };

  setTimeout(() => {
    player.isAttacking = false;
    player.attackBox = null;
  }, 250);
}

function updatePlayer() {
  if (keys.left) {
    player.x -= player.speed;
    player.facing = "left";
  }
  if (keys.right) {
    player.x += player.speed;
    player.facing = "right";
  }

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

  cameraX = player.x - BASE_WIDTH / 2;
  if (cameraX < 0) cameraX = 0;
}

/* ================== ENEMY LOGIC ================== */
function updateEnemyFacing(e) {
  if (e.symmetric) return;
  e.facing = player.x < e.x ? "left" : "right";
}

/* ================== COLLISION ================== */
function hit(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x &&
         a.y < b.y+b.h && a.y+a.h > b.y;
}

/* ================== DRAW ================== */
function drawSky() {
  ctx.drawImage(skyImg, -cameraX*0.3, 0, BASE_WIDTH*2, BASE_HEIGHT);
}

function drawGround() {
  for (let y=0;y<2;y++){
    for (let i=-1;i<40;i++){
      ctx.drawImage(
        groundImg,
        i*TILE - cameraX%TILE,
        GROUND_Y + y*TILE,
        TILE,
        TILE
      );
    }
  }
}

function drawPlayer() {
  const img = playerImg[player.state];
  ctx.save();
  if (player.facing === "left") {
    ctx.scale(-1,1);
    ctx.drawImage(img, -(player.x-cameraX+player.w), player.y, player.w, player.h);
  } else {
    ctx.drawImage(img, player.x-cameraX, player.y, player.w, player.h);
  }
  ctx.restore();
}

function drawEnemies() {
  enemies.forEach(e=>{
    updateEnemyFacing(e);
    const img = enemyImg[e.type];
    ctx.save();

    let mirror = false;
    if (!e.symmetric && e.nativeFacing && e.facing !== e.nativeFacing)
      mirror = true;

    if (mirror) {
      ctx.scale(-1,1);
      ctx.drawImage(img, -(e.x-cameraX+e.w), e.y, e.w, e.h);
    } else {
      ctx.drawImage(img, e.x-cameraX, e.y, e.w, e.h);
    }
    ctx.restore();

    ctx.fillStyle="red";
    ctx.fillRect(e.x-cameraX, e.y-6, e.w*(e.hp/e.maxHp),4);

    if (player.attackBox && hit(player.attackBox, e)) {
      e.hp -= 1;
    }
  });

  enemies = enemies.filter(e=>e.hp>0);
}

function drawHUD() {
  ctx.fillStyle="white";
  ctx.font="14px Arial";
  ctx.fillText("HP: 100", 20, 30);
  ctx.fillText("MP: 50", 20, 50);
}

/* ================== LOOP ================== */
function gameLoop() {
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.clearRect(0,0,BASE_WIDTH,BASE_HEIGHT);

  drawSky();
  drawGround();
  updatePlayer();
  drawEnemies();
  drawPlayer();
  drawHUD();

  ctx.setTransform(1,0,0,1,0,0);
  requestAnimationFrame(gameLoop
