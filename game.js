// ===================== Player =====================
let player = {
    hp: 100,
    mp: 50,
    level: 1,
    exp: 0,
    gold: 0,
    attack: 10,
    magic: 15,
    inventory: {Potion: 0, Sword: false, Armor: false},
    skills: {comboLevel: 1}
};

let enemy = {};
let logDiv = document.getElementById("log");
let inventoryList = document.getElementById("inventory-list");

// ===================== Helper =====================
function log(msg){
    console.log(msg); // debug extreme
    logDiv.innerHTML += msg + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight;
}

function playSfx(src){
    let sfx = new Audio(src);
    sfx.play().catch(e => console.warn("SFX gagal load:", src));
}

// ===================== Stats / Inventory =====================
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

    if(Math.random() < 0.05){
        enemy = {name:"Dragon Boss", hp:300, attack:35, boss:true};
        log("🔥 Boss Epik muncul! 🔥");
        playSfx("assets/boss.mp3");
    } else if(Math.random() < 0.15){
        enemy = {name:"Mini-Boss", hp:150, attack:20, boss:true};
        log("🔥 Mini-Boss muncul! 🔥");
        playSfx("assets/mini-boss.mp3");
    } else {
        enemy = enemies[Math.floor(Math.random()*enemies.length)];
        log(`Musuh baru muncul: ${enemy.name} HP:${enemy.hp}`);
    }
    console.log("DEBUG: enemy object", enemy); // debug extreme
}

// ===================== Actions =====================
function attack(){
    if(player.hp <= 0) return;
    let dmg = player.attack + Math.floor(Math.random()*10);
    enemy.hp -= dmg;

    if(player.inventory.Sword){
        playSfx("assets/sword.mp3");
        log(`Lo menyerang ${enemy.name} dengan pedang ${dmg} damage!`);
    } else {
        playSfx("assets/punch.mp3");
        log(`Lo menyerang ${enemy.name} dengan tinju ${dmg} damage!`);
    }
    console.log("DEBUG: Attack dmg", dmg, "Enemy HP now", enemy.hp);
    enemyTurn();
}

function magic(){
    if(player.hp <= 0) return;
    if(player.mp < 10){ log("MP kurang!"); return; }
    let dmg = player.magic + Math.floor(Math.random()*15);
    enemy.hp -= dmg;
    player.mp -= 10;
    playSfx("assets/magic.mp3");
    log(`Lo pake magic ke ${enemy.name} ${dmg} damage!`);
    console.log("DEBUG: Magic dmg", dmg, "Enemy HP now", enemy.hp);
    enemyTurn();
}

function combo(){
    if(player.hp <= 0) return;
    let mpCost = 10 + player.skills.comboLevel*5;
    if(player.mp < mpCost){ log("MP kurang buat combo!"); return; }
    let dmg = player.attack + player.magic + player.skills.comboLevel*10 + Math.floor(Math.random()*20);
    enemy.hp -= dmg;
    player.mp -= mpCost;
    playSfx("assets/magic.mp3");
    log(`🔥 Combo Level ${player.skills.comboLevel}! ${enemy.name} kena ${dmg} damage! 🔥`);
    console.log("DEBUG: Combo dmg", dmg, "Enemy HP now", enemy.hp);
    enemyTurn();
}

function heal(){
    if(player.hp <= 0) return;
    let healAmt = 20 + Math.floor(Math.random()*20);
    player.hp = Math.min(player.hp + healAmt, 100 + (player.inventory.Armor?50:0));
    playSfx("assets/heal.mp3");
    log(`Lo heal ${healAmt} HP!`);
    console.log("DEBUG: Heal HP", healAmt, "Player HP now", player.hp);
    enemyTurn();
}

function useItem(){
    if(player.inventory.Potion > 0){
        let healAmt = 50;
        player.hp = Math.min(player.hp + healAmt, 100 + (player.inventory.Armor?50:0));
        player.inventory.Potion--;
        log(`Lo pake Potion +${healAmt} HP!`);
        updateInventory();
        console.log("DEBUG: Used Potion, Player HP now", player.hp);
        enemyTurn();
    } else {
        log("Ga ada Potion!");
    }
}

// ===================== Enemy Turn =====================
function enemyTurn(){
    if(enemy.hp <= 0){
        log(`${enemy.name} mati!`);
        gainExp(30 + (enemy.boss?50:0));
        lootDrop();
        spawnEnemy();
        updateStats();
        return;
    }
    let dmg = enemy.attack + Math.floor(Math.random()*5);
    player.hp -= dmg;
    log(`${enemy.name} menyerang lo ${dmg} damage!`);
    console.log("DEBUG: Enemy attack dmg", dmg, "Player HP now", player.hp);
    checkPlayer();
    updateStats();
}

// ===================== EXP & Level =====================
function gainExp(exp){
    player.exp += exp;
    player.gold += Math.floor(exp/2);
    if(player.exp >= 50){
        player.level++;
        player.exp = 0;
        player.hp = 100;
        player.mp = 50;
        player.attack += 5;
        player.magic += 5;
        log("LEVEL UP! Player jadi lebih kuat!");
    }
    updateStats();
}

// ===================== Loot Drop =====================
function lootDrop(){
    if(Math.random() < 0.5){
        player.inventory.Potion++;
        log("Loot: 1 Potion!");
        updateInventory();
    }
}

// ===================== Shop =====================
function openShop(){ document.getElementById("shop").style.display="block"; }
function closeShop(){ document.getElementById("shop").style.display="none"; }

function buyItem(item){
    if(item=="Potion" && player.gold>=10){ 
        player.inventory.Potion++; player.gold-=10; log("Beli Potion"); 
    }
    if(item=="Sword" && player.gold>=50 && !player.inventory.Sword){ 
        player.inventory.Sword=true; player.attack+=10; player.gold-=50; log("Beli Sword +10 attack"); 
    }
    if(item=="Armor" && player.gold>=50 && !player.inventory.Armor){ 
        player.inventory.Armor=true; player.hp+=50; player.gold-=50; log("Beli Armor +50 HP"); 
    }
    updateStats();
}

// ===================== Save / Load =====================
function saveGame(){ 
    localStorage.setItem("rpgSave", JSON.stringify(player)); 
    log("Game tersimpan!"); 
}

function loadGame(){ 
    let data = JSON.parse(localStorage.getItem("rpgSave")); 
    if(data){ 
        player = data; 
        log("Game dimuat!"); 
        updateStats(); 
    }
}

// ===================== Initialize =====================
spawnEnemy();
updateStats();
log("Game Berhasil Dimuat");
log("🔥 RPG Savage V3 | Dev: Rey | TikTok:@reyysaiko | Note: Tunggu kelanjutan updatenya boss 😏 🔥");
log("Ini Game buatan Reyy Dan akan terus berkembang Jika anda berkenan Berinvestasi hubungi nomer ini 0851-8508-3991 Terimakasih 🤭👍");
