const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* AUDIO */
const audio = {
  bgm: new Audio("assets/backsound.mp3"),
  punch: new Audio("assets/Punch.mp3"),
  sword: new Audio("assets/Sword.mp3"),
  magic: new Audio("assets/magic.mp3"),
  heal: new Audio("assets/heal.mp3")
};
audio.bgm.loop = true;
audio.bgm.volume = 0.4;
audio.bgm.play();

/* SPRITE */
const sprite = {
  idle: new Image(),
  run: new Image(),
  attack: new Image()
};
sprite.idle.src = "assets/player/player_idle.png";
sprite.run.src = "assets/player/player_run.png";
sprite.attack.src = "assets/player/player_attack.png";

/* PLAYER */
const PLAYER_SIZE = 64;
let player = {
  x: 200,
  y: 300,
  speed: 3,
  state: "idle",
  frame: 0,
  tick: 0,
  attacking: false,
  cooldown: 0,

  hp: 100,
  maxHp: 100,
  mana: 50,

  gold: 0,
  hasSword: false,
  armor: 0,

  combo: 0,
  dead: false
};

/* SAVE LOAD */
function saveGame() {
  localStorage.setItem("save", JSON.stringify(player));
}
function loadGame() {
  const d = localStorage.getItem("save");
  if (d) player = JSON.parse(d);
}
loadGame();

/* ENEMY */
const enemyImg = new Image();
let enemy = {
  x: 520,
  y: 300,
  hp: 120,
  maxHp: 120,
  dmg: 10,
  scale: 0.6,
  img: "assets/slime.png"
};

/* INPUT */
const keys = {};
onkeydown = e => keys[e.key] = true;
onkeyup = e => keys[e.key] = false;

/* JOYSTICK */
let joyX = 0;
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

joystick.ontouchmove = e => {
  const r = joystick.getBoundingClientRect();
  let x = e.touches[0].clientX - r.left - 60;
  x = Math.max(-40, Math.min(40, x));
  joyX = x / 40;
  stick.style.left = 35 + x + "px";
};
joystick.ontouchend = () => {
  joyX = 0;
  stick.style.left = "35px";
};

/* LOGIC */
function updatePlayer() {
  if (player.attacking || player.dead) return;

  let move = false;
  if (keys["a"] || joyX < -0.2) { player.x -= player.speed; move = true; }
  if (keys["d"] || joyX > 0.2) { player.x += player.speed; move = true; }

  player.state = move ? "run" : "idle";
}

function distance() {
  return Math.abs(player.x - enemy.x);
}

/* ATTACK */
function attack(type) {
  if (player.cooldown > 0 || player.dead) return;
  if (type === "sword" && !player.hasSword) return;
  if (type === "magic" && player.mana < 10) return;
  if (distance() > 120) return;

  player.attacking = true;
  player.state = "attack";
  player.frame = 0;
  player.cooldown = 40;
  player.combo++;

  if (type === "magic") player.mana -= 10;
  audio[type].currentTime = 0;
  audio[type].play();

  enemy.hp -= 10 + player.combo * 2;

  setTimeout(() => {
    player.attacking = false;
    player.state = "idle";
  }, 300);

  if (enemy.hp <= 0) {
    enemy.hp = enemy.maxHp;
    player.gold += 20;
    player.combo = 0;
    saveGame();
  }
}

/* ENEMY AI */
let enemyCooldown = 0;
function updateEnemy() {
  if (enemy.x > player.x + 80) enemy.x -= 1;
  if (enemy.x < player.x - 80) enemy.x += 1;

  if (distance() < 90 && enemyCooldown <= 0) {
    enemyCooldown = 80;
    player.hp -= enemy.dmg;
    if (player.hp <= 0) player.dead = true;
  }
}

/* SHOP */
function toggleShop() {
  const s = document.getElementById("shop");
  s.style.display = s.style.display === "block" ? "none" : "block";
}
function buySword() {
  if (player.gold >= 50 && !player.hasSword) {
    player.gold -= 50;
    player.hasSword = true;
    saveGame();
  }
}
function buyArmor() {
  if (player.gold >= 50) {
    player.gold -= 50;
    player.maxHp += 20;
    player.hp += 20;
    saveGame();
  }
}

/* HEAL */
function heal() {
  if (player.mana < 15) return;
  audio.heal.play();
  player.mana -= 15;
  player.hp = Math.min(player.maxHp, player.hp + 30);
}

/* DRAW */
function drawPlayer() {
  const img = sprite[player.state];
  const fw = img.width / 8;
  ctx.drawImage(img, fw * player.frame, 0, fw, img.height,
    player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

  player.tick++;
  if (player.tick > 6) {
    player.frame = (player.frame + 1) % 8;
    player.tick = 0;
  }
}

function drawEnemy() {
  enemyImg.src = enemy.img;
  const size = PLAYER_SIZE * enemy.scale;
  ctx.drawImage(enemyImg, enemy.x, enemy.y - size, size, size);

  ctx.fillStyle = "red";
  ctx.fillRect(enemy.x, enemy.y - size - 8, size, 6);
  ctx.fillStyle = "lime";
  ctx.fillRect(enemy.x, enemy.y - size - 8, (enemy.hp / enemy.maxHp) * size, 6);
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.fillText(`HP ${player.hp}`, 20, 30);
  ctx.fillText(`Gold ${player.gold}`, 20, 50);
  ctx.fillText(`Combo x${player.combo}`, 20, 70);

  if (player.dead) {
    ctx.font = "30px monospace";
    ctx.fillText("GAME OVER", 280, 220);
  }
}

/* LOOP */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateEnemy();
  drawPlayer();
  drawEnemy();
  drawUI();

  if (player.cooldown > 0) player.cooldown--;
  if (enemyCooldown > 0) enemyCooldown--;

  requestAnimationFrame(loop);
}
loop();
