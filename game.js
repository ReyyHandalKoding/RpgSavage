// ===================== Player =====================
let player = {
    hp: 100, mp:50, level:1, exp:0, gold:0,
    attack:10, magic:15,
    inventory: {Potion:0, Sword:false, Armor:false},
    skills: {comboLevel:1}
};

let enemy = {};
let logDiv = document.getElementById("log");
let inventoryList = document.getElementById("inventory-list");
let playerEl = document.getElementById("player");
let enemyEl = document.getElementById("enemy");

// ===================== Helper =====================
function log(msg){
    console.log(msg);
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

// ===================== Spawn Enemy =====================
function spawnEnemy(){
    let enemies = [
        {name:"Slime", hp:50, attack:5, img:'assets/slime.png'},
        {name:"Goblin", hp:70, attack:10, img:'assets/goblin.png'},
        {name:"Wolf", hp:90, attack:12, img:'assets/wolf.png'}
    ];

    if(Math.random() < 0.05){
        enemy = {name:"Dragon Boss", hp:300, attack:35, boss:true, img:'assets/boss.png'};
        log("🔥 Boss Epik muncul! 🔥");
        playSfx("assets/boss.mp3");
    } else if(Math.random() < 0.15){
        enemy = {name:"Mini-Boss", hp:150, attack:20, boss:true, img:'assets/mini-boss.png'};
        log("🔥 Mini-Boss muncul! 🔥");
        playSfx("assets/mini-boss.mp3");
    } else {
        enemy = enemies[Math.floor(Math.random()*enemies.length)];
        log(`Musuh baru muncul: ${enemy.name} HP:${enemy.hp}`);
    }
    enemyEl.style.backgroundImage = `url('${enemy.img}')`;
    enemyEl.style.backgroundSize = 'cover';
    console.log("DEBUG: enemy object", enemy);
}

// ===================== Animasi Player =====================
let currentFrame = 0;
function playerAnimation(action){
    // contoh sederhana: idle=0, attack=1, magic=2 frame
    if(action==='idle') currentFrame=0;
    if(action==='attack') currentFrame=1;
    if(action==='magic') currentFrame=2;
    playerEl.style.backgroundPosition = `-${currentFrame*128}px 0px`;
}

// ===================== Actions =====================
function attack(){
    if(player.hp <=0) return;
    playerAnimation('attack');
    let dmg = player.attack + Math.floor(Math.random()*10);
    enemy.hp -= dmg;

    if(player.inventory.Sword){
        playSfx("assets/sword.mp3");
        log(`Lo menyerang ${enemy.name} dengan pedang ${dmg} damage!`);
    } else {
        playSfx("assets/punch.mp3");
        log(`Lo menyerang ${enemy.name} dengan tinju ${dmg} damage!`);
    }
    setTimeout(()=>playerAnimation('idle'), 300);
    enemyTurn();
}

function magic(){
    if(player.hp<=0) return;
    if(player.mp<10){ log("MP kurang!"); return; }
    player.mp -=10;
    let dmg = player.magic + Math.floor(Math.random()*15);
    enemy.hp -= dmg;
    playerAnimation('magic');
    playSfx("assets/magic.mp3");
    log(`Lo pake magic ke ${enemy.name} ${dmg} damage!`);
    setTimeout(()=>playerAnimation('idle'), 300);
    enemyTurn();
}

// ===================== Enemy Turn / Other Functions =====================
function combo(){ /* implement combo */ }
function heal(){ /* implement heal */ }
function useItem(){ /* implement potion */ }
function enemyTurn(){ /* implement enemy attack */ }
function gainExp(exp){ /* implement level up */ }
function lootDrop(){ /* implement loot */ }
function openShop(){ document.getElementById("shop").style.display="block"; }
function closeShop(){ document.getElementById("shop").style.display="none"; }
function buyItem(item){ /* implement shop */ }

function showCredit(){
    alert("RPG Savage V3\nDev: Rey\nTikTok:@reyysaiko\nNote: Tunggu kelanjutan updatenya boss 😏");
}

// ===================== Initialize =====================
spawnEnemy();
updateStats();
playerAnimation('idle');
log("🔥 RPG Savage V3 | Dev: Rey | TikTok:@reyysaiko | Note: Tunggu kelanjutan updatenya boss 😏 🔥");
