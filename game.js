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
  heal: new Audio("assets/heal.mp3"),
};
audio.bgm.loop = true;
audio.bgm.volume = 0.4;
audio.bgm.play();

/* ================= SPRITE ================= */
const sprite = {
  idle: new Image(),
  run: new Image(),
  attack: new Image()
};
sprite.idle.src   = "assets/player/player_idle.png";
sprite.run.src    = "assets/player/player_run.png";
sprite.attack.src = "assets/player/player_attack.png";

/* ================= PLAYER ================= */
const PLAYER_SIZE = 64;
let player = {
  x: 200,
  y: 300,
  speed: 3,

  state: "idle",
  frame: 0,
  tick: 0,
  attacking: false,

  level: 1,
  exp: 0,
  gold: 0,

  sword: 0,
  armor: 0,

  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,

  dead: false
};

/* ================= ENEMY ================= */
let enemy;
let killCount = 0;
const enemyImg = new Image();

function spawnEnemy(type = "slime") {
  if (type === "slime")
    return { name:"Slime", hp:60, maxHp:60, dmg:4, scale:0.6, img:"assets/slime.png", gold:15 };

  if (type === "goblin")
    return { name:"Goblin", hp:90, maxHp:90, dmg:7, scale:0.85, img:"assets/goblin.png", gold:25 };

  if (type === "wolf")
    return { name:"Wolf", hp:160, maxHp:160, dmg:14, scale:2.5, img:"assets/wolf.png", gold:45 };

  if (type === "mini") {
    audio.miniBoss.play();
    return { name:"Mini Boss", hp:300, maxHp:300, dmg:25, scale:3.5, img:"assets/mini-boss.png", gold:120 };
  }

  audio.bgm.pause();
  audio.boss.loop = true;
  audio.boss.play();
  return { name:"BOSS", hp:900, maxHp:900, dmg:40, scale:7.5, img:"assets/boss.png", gold:500 };
}
enemy = spawnEnemy();

/* ================= INPUT ================= */
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

/* ================= JOYSTICK ================= */
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
let joyX = 0;

joystick.ontouchmove = e => {
  const r = joystick.getBoundingClientRect();
  let x = e.touches[0].clientX - r.left - 60;
  const max = 40;
  x = Math.max(-max, Math.min(max, x));
  joyX = x / max;
  stick.style.left = 35 + x + "px";
};
joystick.ontouchend = () => {
  joyX = 0;
  stick.style.left = "35px";
};

/* ================= LOGIC ================= */
function updatePlayer() {
  if (player.dead || player.attacking) return;

  let moving = false;

  if (keys["a"] || keys["ArrowLeft"] || joyX < -0.2) {
    player.x -= player.speed;
    moving = true;
  }
  if (keys["d"] || keys["ArrowRight"] || joyX > 0.2) {
    player.x += player.speed;
    moving = true;
  }

  player.state = moving ? "run" : "idle";
}

function calcDamage(type) {
  let base = 0;
  if (type === "punch") base = 5;
  if (type === "sword") base = 12 + player.sword * 5;
  if (type === "magic") base = 18;
  return base + player.level * 2;
}

function attack(type) {
  if (player.attacking || player.dead) return;
  if (type === "magic" && player.mana < 10) return;

  if (type === "magic") player.mana -= 10;
  audio[type].currentTime = 0;
  audio[type].play();

  enemy.hp -= calcDamage(type);

  player.attacking = true;
  player.state = "attack";
  player.frame = 0;

  setTimeout(() => {
    player.attacking = false;
    player.state = "idle";
  }, 400);

  if (enemy.hp <= 0) {
    killCount++;
    player.gold += enemy.gold;
    player.exp += 40;

    if (killCount === 3) enemy = spawnEnemy("goblin");
    else if (killCount === 6) enemy = spawnEnemy("wolf");
    else if (killCount === 10) enemy = spawnEnemy("mini");
    else if (killCount === 15) enemy = spawnEnemy("boss");
    else enemy = spawnEnemy("slime");
  }
}

/* ================= ENEMY ATTACK ================= */
let enemyCooldown = 0;
function enemyAttack() {
  if (enemyCooldown > 0 || player.dead) return;

  enemyCooldown = 120;
  const dmg = Math.max(1, enemy.dmg - player.armor * 3);
  player.hp -= dmg;

  if (player.hp <= 0) {
    player.hp = 0;
    player.dead = true;
  }
}

/* ================= HEAL & SHOP ================= */
function heal() {
  if (player.mana < 15 || player.dead) return;
  audio.heal.play();
  player.mana -= 15;
  player.hp = Math.min(player.maxHp, player.hp + 30);
}

function toggleShop() {
  const s = document.getElementById("shop");
  s.style.display = s.style.display === "block" ? "none" : "block";
}

function buySword() {
  if (player.gold >= 50) {
    player.gold -= 50;
    player.sword++;
  }
}

function buyArmor() {
  if (player.gold >= 50) {
    player.gold -= 50;
    player.armor++;
    player.maxHp += 20;
    player.hp += 20;
  }
}

/* ================= DRAW ================= */
function drawPlayer() {
  const img = sprite[player.state];
  const fw = img.width / 8;

  ctx.drawImage(
    img,
    fw * player.frame,
    0,
    fw,
    img.height,
    player.x,
    player.y,
    PLAYER_SIZE,
    PLAYER_SIZE
  );

  player.tick++;
  if (player.tick > 6) {
    player.frame = (player.frame + 1) % 8;
    player.tick = 0;
  }
}

function drawEnemy() {
  enemyImg.src = enemy.img;
  const size = PLAYER_SIZE * enemy.scale;

  ctx.drawImage(enemyImg, 520, 320 - size, size, size);

  ctx.fillStyle = "red";
  ctx.fillRect(520, 280, size, 10);
  ctx.fillStyle = "lime";
  ctx.fillRect(520, 280, (enemy.hp / enemy.maxHp) * size, 10);
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "12px 'Press Start 2P'";
  ctx.fillText(`LV ${player.level}`, 20, 30);
  ctx.fillText(`❤️ ${player.hp}/${player.maxHp}`, 20, 50);
  ctx.fillText(`✨ ${player.mana}/${player.maxMana}`, 20, 70);
  ctx.fillText(`💰 ${player.gold}`, 20, 90);

  if (player.dead) {
    ctx.fillStyle = "red";
    ctx.font = "30px monospace";
    ctx.fillText("GAME OVER", 280, 220);
  }
}

/* ================= LOOP ================= */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  drawPlayer();
  drawEnemy();
  drawUI();

  enemyAttack();
  if (enemyCooldown > 0) enemyCooldown--;

  requestAnimationFrame(loop);
}
loop();
