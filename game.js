const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== AUDIO =====
const BGM = new Audio("assets/Backsound.mp3");
const BossBGM = new Audio("assets/Boss.mp3");
const HealSound = new Audio("assets/Heal.mp3");
const MagicSound = new Audio("assets/Magic.mp3");
const MiniBossSound = new Audio("assets/mini-boss.mp3");
const PunchSound = new Audio("assets/Punch.mp3");
const SwordSound = new Audio("assets/Sword.mp3");

document.addEventListener("click", () => { if(BGM.paused) BGM.play(); }, {once:true});

// ===== MAP =====
const mapImg = new Image();
mapImg.src = "assets/map.png";
const mapWidth = 1600;   // sesuai map.png
const mapHeight = 1200;

// ===== PLAYER =====
const player = {
    x: 100,
    y: 100,
    size: 64,
    speed: 4,
    hp: 100,
    isAttacking: false
};

// ===== PLAYER SPRITES =====
const playerIdleImg = new Image(); playerIdleImg.src = "assets/player/player_idle.png";
const playerRunImg = new Image(); playerRunImg.src = "assets/player/player_run.png";
const playerAttackImg = new Image(); playerAttackImg.src = "assets/player/player_attack.png";
let playerFrame = 0;
let frameCounter = 0;
const frameSpeed = 5;

// ===== CAMERA =====
const camera = { x:0, y:0 };

// ===== ENEMY =====
const enemyTypes = [
    { imgSrc:"assets/slime.png", size:48, hp:10, speed:1 },
    { imgSrc:"assets/goblin.png", size:56, hp:15, speed:1.2 },
    { imgSrc:"assets/wolf.png", size:64, hp:20, speed:1.5 },
    { imgSrc:"assets/mini-boss.png", size:80, hp:50, speed:1 },
    { imgSrc:"assets/boss.png", size:100, hp:100, speed:0.8 }
];
const enemies = [];
for(let i=0;i<10;i++){
    const type = enemyTypes[Math.floor(Math.random()*enemyTypes.length)];
    const img = new Image(); img.src = type.imgSrc;
    enemies.push({
        x: Math.random()*(mapWidth-100),
        y: Math.random()*(mapHeight-100),
        size: type.size,
        hp: type.hp,
        speed: type.speed,
        dirX: Math.random()<0.5?-1:1,
        dirY: Math.random()<0.5?-1:1,
        img: img
    });
}

// ===== INPUT =====
const keys = {};
document.addEventListener("keydown", e=>keys[e.key.toLowerCase()]=true);
document.addEventListener("keyup", e=>keys[e.key.toLowerCase()]=false);

// ===== COLLISION =====
function hit(a,b){
    return a.x<a.x+b.size && a.x+a.size>b.x &&
           a.y<a.y+b.size && a.y+a.size>b.y;
}

// ===== UPDATE =====
function update(){
    let nx=player.x, ny=player.y;
    if(keys["w"]) ny-=player.speed;
    if(keys["s"]) ny+=player.speed;
    if(keys["a"]) nx-=player.speed;
    if(keys["d"]) nx+=player.speed;

    // simple map collision
    nx = Math.max(0, Math.min(nx, mapWidth-player.size));
    ny = Math.max(0, Math.min(ny, mapHeight-player.size));

    player.x=nx; player.y=ny;

    // camera follow
    camera.x = player.x - canvas.width/2 + player.size/2;
    camera.y = player.y - canvas.height/2 + player.size/2;

    // enemy movement
    enemies.forEach(e=>{
        let ex = e.x + e.dirX*e.speed;
        let ey = e.y + e.dirY*e.speed;
        if(ex<0 || ex+e.size>mapWidth) e.dirX*=-1; else e.x=ex;
        if(ey<0 || ey+e.size>mapHeight) e.dirY*=-1; else e.y=ey;

        if(hit(player,e)) player.hp -= 0.2; // hit damage
    });
}

// ===== DRAW =====
function drawPlayer(){
    let sprite;
    if(player.isAttacking) sprite = playerAttackImg;
    else if(keys["w"]||keys["a"]||keys["s"]||keys["d"]) sprite = playerRunImg;
    else sprite = playerIdleImg;

    const frameWidth = sprite.width/8;
    const frameHeight = sprite.height;

    ctx.drawImage(sprite,
        frameWidth*playerFrame,0,frameWidth,frameHeight,
        player.x-camera.x, player.y-camera.y, player.size, player.size
    );

    frameCounter++;
    if(frameCounter>=frameSpeed){
        playerFrame = (playerFrame+1)%8;
        frameCounter=0;
    }
}

function drawUI(){
    ctx.fillStyle="white";
    ctx.font="20px Arial";
    ctx.fillText("HP: ❤️ ".repeat(Math.floor(player.hp/10)), 10, 30);

    enemies.forEach(e=>{
        ctx.fillText("💀".repeat(Math.ceil(e.hp/5)), e.x-camera.x, e.y-camera.y-10);
    });

    if(player.isAttacking){
        ctx.fillText("👊", player.x-camera.x+20, player.y-camera.y-10);
    }
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(mapImg,-camera.x,-camera.y,mapWidth,mapHeight);

    enemies.forEach(e=>{
        ctx.drawImage(e.img,e.x-camera.x,e.y-camera.y,e.size,e.size);
    });

    drawPlayer();
    drawUI();
}

// ===== LOOP =====
function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
