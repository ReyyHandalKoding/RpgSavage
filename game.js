const player = {
  hp: 100,
  mp: 50,
  level: 1,
  gold: 0,
  atk: 10,
  mag: 15
};

let enemy = {};

const logDiv = document.getElementById("log");
const playerEl = document.getElementById("player");
const enemyEl = document.getElementById("enemy");

function log(msg) {
  logDiv.innerHTML += msg + "<br>";
  logDiv.scrollTop = logDiv.scrollHeight;
}

function updateStats() {
  hp.innerText = player.hp;
  mp.innerText = player.mp;
  lvl.innerText = player.level;
  gold.innerText = player.gold;
}

function spawnEnemy() {
  const enemies = [
    { name: "Slime", hp: 40, atk: 5, img: "assets/slime.png" },
    { name: "Goblin", hp: 60, atk: 8, img: "assets/goblin.png" },
    { name: "Wolf", hp: 80, atk: 10, img: "assets/wolf.png" }
  ];

  enemy = enemies[Math.floor(Math.random() * enemies.length)];
  enemyEl.style.backgroundImage = `url('${enemy.img}')`;
  log(`👾 ${enemy.name} muncul!`);
}

function attack() {
  if (player.hp <= 0) return;

  enemy.hp -= player.atk;
  animatePlayer();

  log(`🗡️ Lo nyerang ${enemy.name} (-${player.atk})`);

  if (enemy.hp <= 0) {
    log(`💀 ${enemy.name} mati!`);
    player.gold += 10;
    spawnEnemy();
  } else {
    enemyTurn();
  }

  updateStats();
}

function magic() {
  if (player.mp < 10) {
    log("❌ MP kurang!");
    return;
  }

  player.mp -= 10;
  enemy.hp -= player.mag;

  log(`🔥 Magic kena ${enemy.name} (-${player.mag})`);

  if (enemy.hp <= 0) {
    log(`💀 ${enemy.name} mati!`);
    spawnEnemy();
  } else {
    enemyTurn();
  }

  updateStats();
}

function heal() {
  if (player.mp < 10) {
    log("❌ MP kurang buat heal!");
    return;
  }

  player.mp -= 10;
  player.hp += 20;
  if (player.hp > 100) player.hp = 100;

  log("💊 HP bertambah");
  updateStats();
}

function enemyTurn() {
  player.hp -= enemy.atk;
  log(`👿 ${enemy.name} nyerang (-${enemy.atk})`);

  if (player.hp <= 0) {
    log("☠️ LO MATI!");
  }
}

function animatePlayer() {
  playerEl.style.transform = "translateX(20px)";
  setTimeout(() => {
    playerEl.style.transform = "translateX(0)";
  }, 200);
}

/* INIT */
spawnEnemy();
updateStats();
log("🔥 RPG Savage V3 dimulai 🔥");
