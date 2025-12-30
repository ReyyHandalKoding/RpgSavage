const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");

/* ===== RESIZE CANVAS ===== */
const BASE_WIDTH=960, BASE_HEIGHT=540;
let scale=1;
function resizeCanvas(){
  const scaleX=window.innerWidth/BASE_WIDTH;
  const scaleY=window.innerHeight/BASE_HEIGHT;
  scale=Math.min(scaleX, scaleY);
  canvas.width=BASE_WIDTH; canvas.height=BASE_HEIGHT;
  canvas.style.width=BASE_WIDTH*scale+"px";
  canvas.style.height=BASE_HEIGHT*scale+"px";
}
window.addEventListener("resize",resizeCanvas);
resizeCanvas();

/* ===== TILE & GROUND ===== */
const TILE=64;
const GROUND_Y=BASE_HEIGHT-TILE*2;

/* ===== LOAD ASSETS ===== */
const skyImg=new Image(); skyImg.src="assets/map/sky.png";
const groundImg=new Image(); groundImg.src="assets/map/ground.png";

const playerImg={idle:new Image(),run:new Image(),attack:new Image()};
playerImg.idle.src="assets/player/player_idle.png";
playerImg.run.src="assets/player/player_run.png";
playerImg.attack.src="assets/player/player_attack.png";

const enemyImg={slime:new Image(),goblin:new Image(),wolf:new Image(),"mini-boss":new Image(),boss:new Image()};
enemyImg.slime.src="assets/enemy/slime.png";
enemyImg.goblin.src="assets/enemy/goblin.png";
enemyImg.wolf.src="assets/enemy/wolf.png";
enemyImg["mini-boss"].src="assets/enemy/mini-boss.png";
enemyImg.boss.src="assets/enemy/boss.png";

/* ===== EFFECTS ===== */
const effectImg={magic:new Image(),heal:new Image()};
effectImg.magic.src="https://i.imgur.com/9Q0r3sB.png";
effectImg.heal.src="https://i.imgur.com/5lQeV7f.png";
let activeEffects=[];

/* ===== AUDIO ===== */
const bgm=new Audio("assets/audio/backsound.mp3"); bgm.loop=true; bgm.volume=0.5; bgm.play();
const sfx={punch:new Audio("assets/audio/punch.mp3"), sword:new Audio("assets/audio/sword.mp3"), magic:new Audio("assets/audio/magic.mp3"), heal:new Audio("assets/audio/heal.mp3")};

/* ===== INPUT ===== */
const keys={left:false,right:false,jump:false};
const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const mobileMove=document.getElementById("mobile-move");
const mobileSkill=document.getElementById("mobile-skill");
if(isMobile){ mobileMove.style.display="flex"; mobileSkill.style.display="flex"; }
else{ mobileMove.style.display="none"; mobileSkill.style.display="none"; }

/* ===== PLAYER ===== */
const player={x:200,y:GROUND_Y-64,w:48,h:64,speed:4,velY:0,onGround:false,state:"idle",facing:"right",isAttacking:false,attackBox:null,
hp:100,mp:50,combo:0,gold:500,level:1,defense:0,hasSword:false};

/* ===== CAMERA ===== */
let cameraX=0;

/* ===== ENEMY ===== */
let enemies=[];
function createEnemy(type,x){
  const cfg={slime:{native:null,symmetric:true},goblin:{native:"left",symmetric:false},
wolf:{native:"left",symmetric:false},"mini-boss":{native:"right",symmetric:false},boss:{native:null,symmetric:true}};
  return {type,x,y:GROUND_Y-48,w:48,h:48,hp:30,maxHp:30,facing:cfg[type].native||"left",
    nativeFacing:cfg[type].native,symmetric:cfg[type].symmetric,attackTimer:0};
}
enemies.push(createEnemy("goblin",700));
enemies.push(createEnemy("wolf",900));
enemies.push(createEnemy("slime",1100));

/* ===== ATTACK / SKILL ===== */
function doAttack(type="punch"){
  if(player.isAttacking) return;
  player.isAttacking=true; player.state="attack";
  if(type==="punch") sfx.punch.currentTime=0, sfx.punch.play();
  else if(type==="sword") sfx.sword.currentTime=0, sfx.sword.play();
  else if(type==="magic") sfx.magic.currentTime=0, sfx.magic.play();
  const range=type==="magic"?60:40;
  player.attackBox={x:player.facing==="right"?player.x+player.w:player.x-range,
                    y:player.y+10,w:range,h:player.h-20};
  if(type==="magic"||type==="heal") spawnEffect(type,player.x+(player.facing==="right"?player.w:-32),player.y);
  setTimeout(()=>{player.isAttacking=false; player.attackBox=null; player.state="idle";},250);
}

function useSkill(n){
  if(n===1) doAttack("punch");
  else if(n===2){ if(player.hasSword) doAttack("sword"); else alert("Belum punya pedang!"); }
  else if(n===3){ const cost=10; if(player.mp>=cost){player.mp-=cost; doAttack("magic");} else alert("MP tidak cukup!"); }
  else if(n===4){ const cost=15; if(player.mp>=cost){player.mp-=cost; player.hp+=30; if(player.hp>100) player.hp=100; sfx.heal.currentTime=0; sfx.heal.play(); spawnEffect("heal",player.x,player.y);} else alert("MP tidak cukup!"); }
}

/* ===== EFFECT ===== */
function spawnEffect(type,x,y){ activeEffects.push({type,x,y,frame:0}); }
function drawEffects(){ activeEffects.forEach((e,i)=>{ const img=effectImg[e.type]; ctx.drawImage(img,e.x-cameraX,e.y-32,64,64); e.frame++; if(e.frame>20) activeEffects.splice(i,1); }); }

/* ===== UPDATE PLAYER ===== */
function updatePlayer(){
  if(keys.left){player.x-=player.speed; player.facing="left";}
  if(keys.right){player.x+=player.speed; player.facing="right";}
  if(keys.jump && player.onGround){player.velY=-12; player.onGround=false;}
  player.velY+=0.6; player.y+=player.velY;
  if(player.y+player.h>=GROUND_Y){player.y=GROUND_Y-player.h; player.velY=0; player.onGround=true;}
  if(!player.isAttacking) player.state=(keys.left||keys.right)?"run":"idle";
  cameraX=player.x-BASE_WIDTH/2; if(cameraX<0) cameraX=0;
}

/* ===== UPDATE ENEMY ===== */
function updateEnemyFacing(e){ if(e.symmetric) return; e.facing=player.x<e.x?"left":"right"; }
function hit(a,b){return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;}

/* ===== DRAW ===== */
function drawSky(){ ctx.drawImage(skyImg,-cameraX*0.3,0,skyImg.width,skyImg.height); }
function drawGround(){ ctx.drawImage(groundImg,-cameraX,GROUND_Y,groundImg.width,groundImg.height); }

function drawPlayer(){
  const img=playerImg[player.state]; ctx.save();
  if(player.facing==="left"){ctx.scale(-1,1); ctx.drawImage(img,-(player.x-cameraX+player.w),player.y,player.w,player.h);}
  else ctx.drawImage(img,player.x-cameraX,player.y,player.w,player.h);
  ctx.restore();
}

function drawEnemies(){
  enemies.forEach((e,i)=>{
    updateEnemyFacing(e);
    const img=enemyImg[e.type]; ctx.save();
    let mirror=false; if(!e.symmetric && e.nativeFacing && e.facing!==e.nativeFacing) mirror=true;
    if(mirror){ctx.scale(-1,1); ctx.drawImage(img,-(e.x-cameraX+e.w),e.y,e.w,e.h);}
    else ctx.drawImage(img,e.x-cameraX,e.y,e.w,e.h);
    ctx.restore();
    ctx.fillStyle="red"; ctx.fillRect(e.x-cameraX,e.y-6,e.w*(e.hp/e.maxHp),4);
    if(player.attackBox && hit(player.attackBox,e)) e.hp-=1;
    if(e.hp<=0) enemies.splice(i,1);
  });
}

/* ===== HUD ===== */
function drawHUD(){
  ctx.fillStyle="white"; ctx.font="16px Arial";
  ctx.fillText(`❤️ HP: ${player.hp}`,20,30);
  ctx.fillText(`🔵 MP: ${player.mp}`,20,50);
  ctx.fillText(`💰 Gold: ${player.gold}`,20,70);
  ctx.fillText(`🏆 Level: ${player.level}`,20,90);
  ctx.fillText(`🔥 Combo: ${player.combo}`,20,110);
}

/* ===== SHOP LOGIC ===== */
const shopDiv=document.getElementById("shop");
shopDiv.querySelectorAll(".shop-item").forEach(div=>{
  div.onclick=()=>{
    const id=div.id;
    if(id==="sword" && player.gold>=100){player.gold-=100; player.hasSword=true; alert("Sword dibeli! Sekarang bisa dipakai E.");}
    else if(id==="magic_book" && player.gold>=200){player.gold-=200; alert("Magic upgraded!");}
    else if(id==="potion" && player.gold>=50){player.gold-=50; player.hp+=50; if(player.hp>100) player.hp=100;}
    else if(id==="armor" && player.gold>=150){player.gold-=150; player.defense+=1; alert("Armor upgraded!");}
    else alert("Gold tidak cukup!");
  }
});

/* ===== MOBILE BUTTONS ===== */
if(isMobile){
  document.getElementById("left").ontouchstart=()=>keys.left=true; document.getElementById("left").ontouchend=()=>keys.left=false;
  document.getElementById("right").ontouchstart=()=>keys.right=true; document.getElementById("right").ontouchend=()=>keys.right=false;
  document.getElementById("jump").ontouchstart=()=>keys.jump=true; document.getElementById("jump").ontouchend=()=>keys.jump=false;
  document.getElementById("skill1").ontouchstart=()=>useSkill(1);
  document.getElementById("skill2").ontouchstart=()=>useSkill(2);
  document.getElementById("skill3").ontouchstart=()=>useSkill(3);
  document.getElementById("skill4").ontouchstart=()=>useSkill(4);
}

/* ===== PC KEYBOARD ===== */
document.addEventListener("keydown",e=>{
  if(!isMobile){
    if(e.key==="a"||e.key==="A") keys.left=true;
    if(e.key==="d"||e.key==="D") keys.right=true;
    if(e.key===" ") keys.jump=true;
    if(e.key==="q"||e.key==="Q") useSkill(1);
    if(e.key==="e"||e.key==="E") useSkill(2);
    if(e.key==="z"||e.key==="Z") useSkill(3);
    if(e.key==="x"||e.key==="X") useSkill(4);
  }
});
document.addEventListener("keyup",e=>{
  if(!isMobile){
    if(e.key==="a"||e.key==="A") keys.left=false;
    if(e.key==="d"||e.key==="D") keys.right=false;
    if(e.key===" ") keys.jump=false;
  }
});

/* ===== GAME LOOP ===== */
function gameLoop(){
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.setTransform(scale,0,0,scale,0,0);

  drawSky();
  drawGround();
  updatePlayer();
  drawEnemies();
  drawPlayer();
  drawEffects();
  drawHUD();

  requestAnimationFrame(gameLoop);
}
gameLoop();
