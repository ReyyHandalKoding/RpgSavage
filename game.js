// ===================== Player =====================
let player = {
    hp:100,
    mp:50,
    level:1,
    exp:0,
    gold:0,
    attack:10,
    magic:15,
    inventory:{Potion:0, Sword:false, Armor:false},
    skills:{comboLevel:1}
};

let enemy = {};
let logDiv = document.getElementById("log");
let inventoryList = document.getElementById("inventory-list");

// ===================== Helper =====================
function log(msg){ logDiv.innerHTML += msg + "<br>"; logDiv.scrollTop = logDiv.scrollHeight; }
function playSfx(src){ let sfx = new Audio(src); sfx.play(); }
function updateStats(){
    document.getElementById("player-hp").innerText = player.hp;
    document.getElementById("player-mp").innerText = player.mp;
    document.getElementById("player-level").innerText = player.level;
    document.getElementById("player-exp").innerText = player.exp;
    document.getElementById("player-gold").innerText = player.gold;
    updateInventory();
}
function updateInventory(){
    inventoryList.innerHTML = "";
    for(let item in player.inventory){
        if(item==="Sword" || item==="Armor"){
            inventoryList.innerHTML += `<li>${item}: ${player.inventory[item]?"Owned":"No"}</li>`;
        } else {
            inventoryList.innerHTML += `<li>${item}: ${player.inventory[item]}</li>`;
        }
    }
}

// ===================== Enemy =====================
function spawnEnemy(){
    let enemies = [
        {name:"Slime", hp:50, attack:5},
        {name:"Goblin", hp:70, attack:10},
        {name:"Wolf", hp:90, attack:12}
    ];
    if(Math.random() < 0.15){
        enemy = {name:"Mini-Boss", hp:150, attack:20, boss:true};
        log("🔥 Mini-Boss muncul! 🔥");
        playSfx("assets/mini-boss.mp3");
    } else if(Math.random()<0.05){
        enemy = {name:"Dragon Boss", hp:300, attack:35, boss:true};
        log("🔥 Boss Epik muncul! 🔥");
        playSfx("assets/boss.mp3");
    } else {
        enemy = enemies[Math.floor(Math.random()*enemies.length)];
        log(`Musuh baru muncul: ${enemy.name} HP:${enemy.hp}`);
    }
}

// ===================== Actions =====================
function attack(){
    let dmg = player.attack + Math.floor(Math.random()*10);
    enemy.hp -= dmg;
    if(player.inventory.Sword){
        playSfx("assets/sword.mp3");
        log(`Lo menyerang ${enemy.name} dengan pedang ${dmg} damage!`);
    } else {
        playSfx("assets/punch.mp3");
        log(`Lo menyerang ${enemy.name} dengan tinju ${dmg} damage!`);
    }
    enemyTurn();
}

function magic(){
    if(player.mp<10){ log("MP kurang!"); return; }
    let dmg = player.magic + Math.floor(Math.random()*15);
    enemy.hp -= dmg;
    player.mp -= 10;
    playSfx("assets/magic.mp3");
    log(`Lo pake magic ke ${enemy.name} ${dmg} damage!`);
    enemyTurn();
}

function combo(){
    let mpCost = 10 + player.skills.comboLevel*5;
    if(player.mp < mpCost){ log("MP kurang buat combo!"); return; }
    let dmg = player.attack + player.magic + player.skills.comboLevel*10 + Math.floor(Math.random()*20);
    enemy.hp -= dmg;
    player.mp -= mpCost;
    playSfx("assets/magic.mp3");
    log(`🔥 Combo Level ${player.skills.comboLevel}! ${enemy.name} kena ${dmg} damage! 🔥`);
    enemyTurn();
}

function heal(){
    let healAmt = 20 + Math.floor(Math.random()*20);
    player.hp = Math.min(player.hp + healAmt, 100 + (player.inventory.Armor?50:0));
    playSfx("assets/heal.mp3");
    log(`Lo heal ${healAmt} HP!`);
    enemyTurn();
}

// ===================== Enemy Turn =====================
function enemyTurn(){
    if(enemy.hp <= 0){
        log(`${enemy.name} mati!`);
        gainExp(30 + (enemy.boss?50:0));
        lootDrop();
        spawn