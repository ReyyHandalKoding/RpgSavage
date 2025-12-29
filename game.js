/* ====== BASIC ====== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

/* ORIENTATION OVERLAY */
const rotateOverlay = document.getElementById("rotate-overlay");
function checkOrientation(){
  if(!isMobile) return;
  rotateOverlay.style.display =
    window.innerHeight > window.innerWidth ? "flex":"none";
}
window.addEventListener("resize",checkOrientation);
window.addEventListener("orientationchange",checkOrientation);
checkOrientation();

/* ====== AUDIO (100%) ====== */
let audioUnlocked=false;
const audio={
  bgm:new Audio("assets/backsound.mp3"),
  boss:new Audio("assets/boss.mp3"),
  mini:new Audio("assets/mini-boss.mp3"),
  punch:new Audio("assets/Punch.mp3"),
  sword:new Audio("assets/Sword.mp3"),
  magic:new Audio("assets/magic.mp3"),
  heal:new Audio("assets/heal.mp3")
};
Object.values(audio).forEach(a=>{a.volume=1; a.loop=false;});
audio.bgm.loop=true; audio.boss.loop=true;

const startBtn=document.getElementById("start-audio");
startBtn.style.display="flex";
startBtn.onclick=()=>{
  audioUnlocked=true;
  audio.bgm.play();
  startBtn.style.display="none";
};

/* ====== SPRITES ====== */
const sprite={
  idle:new Image(),
  run:new Image(),
  attack:new Image()
};
sprite.idle.src="assets/player/player_idle.png";
sprite.run.src="assets/player/player_run.png";
sprite.attack.src="assets/player/player_attack.png";

/* ====== PLAYER ====== */
const PLAYER_SIZE=64;
let player={
  x:180,y:300,vy:0,onGround:true,
  speed:3,jumpPower:-8,
  state:"idle",frame:0,tick:0,
  attacking:false,cooldown:0,
  hp:100,maxHp:100,mana:50,
  gold:0,hasSword:false
};

/* ====== ENEMY TYPES ====== */
const ENEMY_TYPES={
  slime:{hp:50,scale:.6,dmg:5,music:null,img:"assets/slime.png"},
  goblin:{hp:80,scale:.8,dmg:7,music:null,img:"assets/goblin.png"},
  wolf:{hp:120,scale:2.5,dmg:10,music:null,img:"assets/wolf.png"},
  miniboss:{hp:400,scale:3.5,dmg:18,music:"mini",img:"assets/mini-boss.png"},
  boss:{hp:1200,scale:7.5,dmg:30,music:"boss",img:"assets/boss.png"}
};

let enemyImg=new Image();
let enemy={};
spawnEnemy("slime");

function spawnEnemy(type){
  const e=ENEMY_TYPES[type];
  enemy={x:520,y:300,hp:e.hp,maxHp:e.hp,dmg:e.dmg,scale:e.scale,type,img:e.img};
  enemyImg.src=e.img;
  if(!audioUnlocked) return;
  audio.bgm.pause(); audio.boss.pause(); audio.mini.pause();
  if(e.music==="boss") audio.boss.play();
  else if(e.music==="mini") audio.mini.play();
  else audio.bgm.play();
}

/* ====== INPUT ====== */
const keys={};
onkeydown=e=>keys[e.key]=true;
onkeyup=e=>keys[e.key]=false;

/* MOBILE MOVE */
if(!isMobile) document.getElementById("mobile-move").style.display="none";
let moveL=false,moveR=false;
const L=document.getElementById("left");
const R=document.getElementById("right");
const J=document.getElementById("jump");
if(L){ L.ontouchstart=()=>moveL=true; L.ontouchend=()=>moveL=false; }
if(R){ R.ontouchstart=()=>moveR=true; R.ontouchend=()=>moveR=false; }
if(J){
  J.ontouchstart=()=>{
    if(player.onGround){ player.vy=player.jumpPower; player.onGround=false; }
  };
}

/* ====== LOGIC ====== */
function distance(){ return Math.abs(player.x-enemy.x); }

function updatePlayer(){
  if(player.attacking){ player.state="attack"; return; }
  let moving=false;
  if(keys["a"]||moveL){ player.x-=player.speed; moving=true; }
  if(keys["d"]||moveR){ player.x+=player.speed; moving=true; }
  if((keys["w"]||keys[" "]) && player.onGround){
    player.vy=player.jumpPower; player.onGround=false;
  }
  player.vy+=0.4; player.y+=player.vy;
  if(player.y>=300){ player.y=300; player.vy=0; player.onGround=true; }
  player.state=moving?"run":"idle";
}

function attack(type){
  if(player.cooldown>0) return;
  if(type==="sword"&&!player.hasSword) return;
  if(type==="magic"&&player.mana<10) return;
  if(distance()>110) return;

  player.attacking=true; player.cooldown=25; player.frame=0;
  if(type==="magic") player.mana-=10;
  if(audioUnlocked){ audio[type].currentTime=0; audio[type].play(); }
  enemy.hp-= (type==="punch"?8:type==="sword"?14:18);
  setTimeout(()=>player.attacking=false,300);
  if(enemy.hp<=0){ player.gold+=20; spawnEnemy("slime"); }
}

function heal(){
  if(player.mana<15) return;
  player.mana-=15;
  player.hp=Math.min(player.maxHp,player.hp+30);
  if(audioUnlocked) audio.heal.play();
}

/* ENEMY AI */
let enemyCD=0;
function updateEnemy(){
  if(enemy.x>player.x+80) enemy.x-=1;
  if(enemy.x<player.x-80) enemy.x+=1;
  if(distance()<90 && enemyCD<=0){
    enemyCD=80; player.hp=Math.max(0,player.hp-enemy.dmg);
  }
}

/* ====== DRAW ====== */
function drawEnemy(){
  const size=PLAYER_SIZE*enemy.scale;
  ctx.drawImage(enemyImg,enemy.x,enemy.y-size,size,size);
}

function drawPlayer(){
  const img=sprite[player.state];
  const fw=img.width/8;
  ctx.drawImage(img,fw*player.frame,0,fw,img.height,
    player.x,player.y,PLAYER_SIZE,PLAYER_SIZE);
  if(++player.tick>6){ player.frame=(player.frame+1)%8; player.tick=0; }
}

function drawHUD(){
  ctx.fillStyle="#fff";
  ctx.fillText(`HP ${player.hp}/${player.maxHp}`,20,30);
  ctx.fillText(`Gold ${player.gold}`,20,50);
}

function drawBossHP(){
  if(enemy.type!=="boss"&&enemy.type!=="miniboss") return;
  const w=canvas.width*.8,h=18,x=canvas.width*.1,y=18;
  ctx.fillStyle="#000"; ctx.fillRect(x-4,y-4,w+8,h+8);
  ctx.fillStyle="red"; ctx.fillRect(x,y,w,h);
  ctx.fillStyle="lime";
  ctx.fillRect(x,y,(enemy.hp/enemy.maxHp)*w,h);
  ctx.fillStyle="#fff";
  ctx.fillText(enemy.type==="boss"?"BOSS":"MINI BOSS",x,y-6);
}

/* ====== SHOP ====== */
function toggleShop(){
  const s=document.getElementById("shop");
  s.style.display=s.style.display==="block"?"none":"block";
}
function buySword(){
  if(player.gold>=50&&!player.hasSword){
    player.gold-=50; player.hasSword=true;
  }
}
function buyArmor(){
  if(player.gold>=50){
    player.gold-=50; player.maxHp+=20; player.hp+=20;
  }
}

/* ====== LOOP ====== */
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  updateEnemy(); drawEnemy();
  updatePlayer(); drawPlayer();
  drawHUD(); drawBossHP();
  if(player.cooldown>0) player.cooldown--;
  if(enemyCD>0) enemyCD--;
  requestAnimationFrame(loop);
}
loop();
