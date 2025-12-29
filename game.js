const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ================= AUDIO ================= */
const audio = {
  bgm: new Audio("assets/backsound.mp3"),
  boss: new Audio("assets/boss.mp3"),
  miniBoss: new Audio("assets/mini-boss.mp3"),
  punch: new Audio("assets/Punch.mp3"),
  sword: new Audio("assets/Sword.mp3"),
  magic: new Audio("assets/magic.mp3"),
  heal: new Audio("assets/heal.mp3")
};

audio.bgm.loop = true;
audio.bgm.volume = 0.5;
audio.bgm.play();

/* ================= SPRITE ================= */
const playerSprite = {
  idle: new Image(),
  run: new Image(),
  attack: new Image()
};

playerSprite.idle.src   = "assets/player/player_idle.png";
playerSprite.run.src    = "assets/player/player_run.png";
playerSprite.attack.src = "assets/player/player_attack.png";

/* ================= PLAYER ================= */
let player = {
  x: 200,
  y: 260,
  speed: 3,
  state: "idle",
  frame: 0,
  frameTick: 0,

  level: 1,
  exp: 0,
  gold: 0,

  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50
};

/* ================= ENEMY ================= */
let enemy = null;
let killCount = 0;
const enemyImg = new Image();

function spawnEnemy(type = "normal") {
  if (type === "mini") {
    audio.miniBoss.play();
    return { name:"Mini Boss", hp:200, maxHp:200, dmg:20, img:"assets/mini-boss.png", gold:80 };
  }
  if (type === "boss") {
    audio.bgm.pause();
    audio.boss.loop = true;
    audio.boss.play();
    return { name:"BOSS", hp:500, maxHp:500, dmg:35, img:"assets/boss.png", gold:300 };
  }
  return { name:"Mob", hp:80, maxHp:80, dmg:10, img:"assets/slime.png", gold:20 };
}

enemy = spawnEnemy();

/* ================= INPUT ================= */
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

/* ================= JOYSTICK ================= */
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
let joy = { x: 0, y: 0 };

joystick.addEventListener("touchmove", e => {
  const rect = joystick.getBoundingClientRect();
  const t = e.touches[0];
  let x = t.clientX - rect.left - 60;
  let y = t.clientY - rect.top - 60;
  const max = 40;
  const d = Math.hypot(x, y);
  if (d > max) { x = x / d * max; y = y / d * max; }
  joy.x = x / max;
  joy.y = y / max;
  stick.style.left = 35 + x + "px";
  stick.style.top  = 35 + y + "px";
});

joystick.addEventListener("touchend", () => {
  joy.x = joy.y = 0;
  stick.style.left = "35px";
  stick.style.top  = "35px";
});

/* ================= LOGIC ================= */
function updatePlayer() {
  let moving = false;

  if (keys["a"] || keys["ArrowLeft"] || joy.x < -0.2) {
    player.x -= player.speed;
    moving = true;
  }
  if (keys["d"] || keys["ArrowRight"] || joy.x > 0.2) {
    player.x += player.speed;
    moving = true;
  }

  if (player.state !== "attack")
    player.state = moving ? "run" : "idle";
}

function attack(type) {
  if (player.state === "attack") return;

  if (type === "magic" && player.mana < 10) return;
  if (type === "magic") player.mana -= 10;

  audio[type].currentTime = 0;
  audio[type].play();

  let dmg = (type === "punch" ? 5 : type === "sword" ? 12 : 18) + player.level * 2;
  enemy.hp -= dmg;

  player.state = "attack";
  player.frame = 0;

  setTimeout(() => player.state = "idle", 350);

  if (enemy.hp <= 0) {
    killCount++;
    player.gold += enemy.gold;
    player.exp += 30;

    if (killCount === 5) enemy = spawnEnemy("mini");
    else if (killCount === 10) enemy = spawnEnemy("boss");
    else enemy = spawnEnemy();
  }
}

function heal() {
  if (player.mana < 15) return;
  audio.heal.play();
  player.mana -= 15;
  player.hp = Math.min(player.maxHp, player.hp + 30);
}

function levelUp() {
  if (player.exp >= 100) {
    player.level++;
    player.exp = 0;
    player.maxHp += 20;
    player.maxMana += 10;
    player.hp = player.maxHp;
    player.mana = player.maxMana;
  }
}

/* ================= DRAW ================= */
function drawPlayer() {
  const img = playerSprite[player.state];
  const fw = img.width / 8;
  ctx.drawImage(img, Math.floor(player.frame) * fw, 0, fw, img.height, player.x, player.y, fw, img.height);

  player.frameTick++;
  if (player.frameTick > 6) {
    player.frame = (player.frame + 1) % 8;
    player.frameTick = 0;
  }
}

function drawEnemy() {
  enemyImg.src = enemy.img;
  ctx.drawImage(enemyImg, 520, 250, 100, 100);

  ctx.fillStyle = "red";
  ctx.fillRect(520, 230, 100, 8);
  ctx.fillStyle = "lime";
  ctx.fillRect(520, 230, (enemy.hp / enemy.maxHp) * 100, 8);
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.fillText(`LV ${player.level}`, 20, 20);
  ctx.fillText(`HP ${player.hp}/${player.maxHp}`, 20, 40);
  ctx.fillText(`MP ${player.mana}/${player.maxMana}`, 20, 60);
  ctx.fillText(`Gold ${player.gold}`, 20, 80);
}

/* ================= LOOP ================= */
function loop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  updatePlayer();
  drawPlayer();
  drawEnemy();
  drawUI();
  levelUp();

  requestAnimationFrame(loop);
}

loop();
