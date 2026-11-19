(()=>{'use strict';
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),mini=document.getElementById('mini'),mc=mini.getContext('2d');
const $=id=>document.getElementById(id),keys=new Set(),TILE=240,ROAD=72,WORLD=8*TILE;
let W=0,H=0,DPR=1,playing=false,paused=false,last=0,clock=0,toastUntil=0,mission=0,missionProgress=0,missionTimer=0,saveTimer=0,frameScheduled=false;
const player={x:0,y:0,a:0,hp:100,money:500,wanted:0,heat:0,vehicle:null,invulnerable:0};
const camera={x:0,y:0};const cars=[],people=[],police=[],sparks=[];
const START={x:0,y:0};
const missions=[
 {title:'THE FIRST RUN',text:'Find a parked car and press E to take the wheel.',type:'enter',reward:400},
 {title:'HOT DELIVERY',text:'Drive to the amber waypoint on the east side of the city.',type:'drive',x:1440,y:480,reward:1200},
 {title:'LOSE THE HEAT',text:'Escape the police and let your wanted level fall to zero.',type:'escape',reward:1500},
 {title:'THE DOCKS JOB',text:'Reach the marked docks on foot or by car.',type:'reach',x:-1440,y:1200,reward:2200},
 {title:'MIDNIGHT TRANSFER',text:'Deliver a vehicle to the north garage.',type:'deliver',x:-720,y:-1440,reward:3400},
 {title:'KING OF NEON',text:'Survive a three-star pursuit for 45 seconds.',type:'survive',reward:6000}
];
function rnd(a,b){return a+Math.random()*(b-a)}function clamp(n,a,b){return Math.max(a,Math.min(b,n))}function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}function norm(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function road(x,y){return Math.abs(((x+TILE/2)%TILE+TILE)%TILE-TILE/2)<ROAD/2||Math.abs(((y+TILE/2)%TILE+TILE)%TILE-TILE/2)<ROAD/2}
function buildingCollision(x,y,radius=9){const dx=Math.abs(((x+TILE/2)%TILE+TILE)%TILE-TILE/2),dy=Math.abs(((y+TILE/2)%TILE+TILE)%TILE-TILE/2);return dx>ROAD/2-radius&&dx<84+radius&&dy>ROAD/2-radius&&dy<84+radius}
function nearestSafe(x,y,radius=9){if(!buildingCollision(x,y,radius))return {x,y};const ix=Math.round(x/TILE)*TILE,iy=Math.round(y/TILE)*TILE;const candidates=[{x:ix,y},{x,y:iy},{x:ix,y:iy}];candidates.sort((a,b)=>(a.x-x)**2+(a.y-y)**2-((b.x-x)**2+(b.y-y)**2));return candidates.find(p=>!buildingCollision(p.x,p.y,radius))||{x:ix,y:iy}}
function canMove(x,y,radius){return !buildingCollision(x,y,radius)&&Math.abs(x)<=WORLD&&Math.abs(y)<=WORLD}
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',resize);resize();
function makeCar(x,y,a,color,ai=false){return {x,y,a,s:0,color,ai,stolen:false,hp:100,police:false,phase:rnd(0,100),turn:0}}
const palette=['#ed706c','#4cc7b7','#d4a1ee','#f0b657','#c8d4e3','#4d82e8','#7bd16e'];
for(let i=0;i<70;i++){const x=Math.floor(rnd(-8,8))*TILE,y=Math.floor(rnd(-8,8))*TILE;if(Math.random()<.5)cars.push(makeCar(x+rnd(-20,20),rnd(-WORLD,WORLD),Math.random()<.5?0:Math.PI,palette[i%palette.length],true));else cars.push(makeCar(rnd(-WORLD,WORLD),y+rnd(-20,20),Math.random()<.5?Math.PI/2:-Math.PI/2,palette[i%palette.length],true))}
// Accessible parked cars make the opening objective completable without chasing traffic.
for(const [x,y,a] of [[0,115,Math.PI/2],[0,-115,-Math.PI/2],[115,0,0],[-115,0,Math.PI]])cars.push(makeCar(x,y,a,palette[cars.length%palette.length],false));
for(let i=0;i<95;i++){let x=rnd(-WORLD,WORLD),y=rnd(-WORLD,WORLD);if(road(x,y)){x+=65;y+=65}people.push({x,y,tx:x+rnd(-80,80),ty:y+rnd(-80,80),color:palette[i%palette.length],phase:rnd(0,10),speed:rnd(13,30)})}
function notify(t){$('toast').textContent=t;$('toast').style.opacity=1;toastUntil=clock+2.6}
function advance(){const m=missions[mission%missions.length];player.money+=m.reward;notify('CONTRACT COMPLETE  +$'+m.reward);mission++;missionProgress=0;missionTimer=0;save()}
function save(){try{localStorage.setItem('neonCountySaveV1',JSON.stringify({x:player.x,y:player.y,money:player.money,hp:player.hp,wanted:player.wanted,mission}))}catch{}}
function load(){try{const d=JSON.parse(localStorage.getItem('neonCountySaveV1')||'null');if(!d||typeof d!=='object'||!Number.isFinite(d.x)||!Number.isFinite(d.y))return false;player.x=clamp(d.x,-WORLD,WORLD);player.y=clamp(d.y,-WORLD,WORLD);player.money=Number.isFinite(d.money)?clamp(d.money,0,100000000):500;player.hp=Number.isFinite(d.hp)?clamp(d.hp,1,100):100;player.wanted=Number.isFinite(d.wanted)?Math.floor(clamp(d.wanted,0,5)):0;mission=Number.isSafeInteger(d.mission)?clamp(d.mission,0,1000000):0;const safe=nearestSafe(player.x,player.y);player.x=safe.x;player.y=safe.y;player.heat=player.wanted?25:0;return true}catch{return false}}
function start(restore){keys.clear();heldPointers.clear();player.vehicle=null;player.heat=0;player.invulnerable=0;police.length=0;missionTimer=0;missionProgress=0;if(restore){if(!load()){Object.assign(player,{x:START.x,y:START.y,a:0,hp:100,money:500,wanted:0});mission=0;notify('NO SAVE FOUND — NEW GAME')}}else{Object.assign(player,{x:START.x,y:START.y,a:0,hp:100,money:500,wanted:0});mission=0;save()}$('menu').hidden=true;$('pause').hidden=true;paused=false;playing=true;last=performance.now();if(!frameScheduled){frameScheduled=true;requestAnimationFrame(frame)}}
$('start').onclick=()=>start(false);$('resume').onclick=()=>start(true);
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(!playing)return;if(paused&&k!=='escape')return;keys.add(k);if(k==='e'&&!e.repeat)interact();if(k==='p'&&!e.repeat){save();notify('GAME SAVED')}if(k==='escape'&&!e.repeat){paused=!paused;keys.clear();$('pause').hidden=!paused;if(!paused)last=performance.now()}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
// Pointer-based controls support simultaneous steering and throttle on touchscreens.
const touchButtons=document.querySelectorAll('#touch [data-key]');
const heldPointers=new Map();
function virtualKey(key,down){
 if(key==='escape'){if(down&&playing){paused=!paused;keys.clear();heldPointers.clear();$('pause').hidden=!paused;last=performance.now()}return}
 if(!playing||paused)return;
 if(key==='e'){if(down)interact();return}
 if(down)keys.add(key);else keys.delete(key);
}
for(const button of touchButtons){
 button.addEventListener('pointerdown',event=>{
  event.preventDefault();
  const key=button.dataset.key;
  button.setPointerCapture(event.pointerId);
  heldPointers.set(event.pointerId,key);
  virtualKey(key,true);
 });
 const release=event=>{
  const key=heldPointers.get(event.pointerId);
  if(key===undefined)return;
  heldPointers.delete(event.pointerId);
  if(![...heldPointers.values()].includes(key))virtualKey(key,false);
 };
 button.addEventListener('pointerup',release);
 button.addEventListener('pointercancel',release);
 button.addEventListener('lostpointercapture',release);
}
function interact(){if(player.vehicle){const v=player.vehicle;const offsets=[{x:v.x+Math.cos(v.a)*28,y:v.y+Math.sin(v.a)*28},{x:v.x-Math.cos(v.a)*28,y:v.y-Math.sin(v.a)*28},{x:v.x+Math.sin(v.a)*30,y:v.y-Math.cos(v.a)*30}];const exit=offsets.find(p=>canMove(p.x,p.y,7));if(!exit){notify('NO SAFE PLACE TO EXIT');return}player.x=exit.x;player.y=exit.y;player.vehicle=null;notify('ON FOOT');return}let nearest=null,best=48;for(const c of cars){const d=dist(player,c);if(d<best){best=d;nearest=c}}if(!nearest){notify('GET CLOSER TO A VEHICLE');return}player.vehicle=nearest;nearest.ai=false;nearest.stolen=true;player.x=nearest.x;player.y=nearest.y;player.a=nearest.a;player.wanted=Math.max(1,player.wanted);player.heat=40;notify('VEHICLE TAKEN  ·  WANTED');if(mission%missions.length===0)advance()}
function hit(damage){if(player.invulnerable>0)return;player.hp-=damage;player.invulnerable=1.3;sparks.push({x:player.x,y:player.y,life:.5});if(player.hp<=0){player.hp=100;player.x=START.x;player.y=START.y;player.vehicle=null;player.money=Math.max(0,player.money-500);player.wanted=0;police.length=0;notify('WASTED  ·  HOSPITAL FEE $500')}}
function update(dt){clock+=dt;player.invulnerable=Math.max(0,player.invulnerable-dt);const oldX=player.x,oldY=player.y;
const up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),left=keys.has('a')||keys.has('arrowleft'),right=keys.has('d')||keys.has('arrowright');
if(player.vehicle){const c=player.vehicle;c.s=clamp(c.s+(up?320*dt:0)-(down?260*dt:0),-135,430);c.s*=Math.exp(-(keys.has(' ')?4.8:.75)*dt);c.a+=(right?1:0)*c.s*dt/100-(left?1:0)*c.s*dt/100;const travel=c.s*dt,steps=Math.max(1,Math.ceil(Math.abs(travel)/8));let crashed=false;
for(let step=0;step<steps;step++){
 const nx=c.x+Math.sin(c.a)*travel/steps,ny=c.y-Math.cos(c.a)*travel/steps;
 if(!canMove(nx,ny,12)){crashed=true;break}
 c.x=nx;c.y=ny;
}
if(crashed){if(Math.abs(c.s)>95){hit(Math.min(24,Math.abs(c.s)*.055));sparks.push({x:c.x,y:c.y,life:.5})}c.s*=-.22}
player.x=c.x;player.y=c.y;player.a=c.a;
if(Math.abs(c.s)>260&&Math.random()<dt*.8)sparks.push({x:c.x,y:c.y,life:.3})}
else{const speed=keys.has('shift')?205:130;const dx=(right?1:0)-(left?1:0),dy=(down?1:0)-(up?1:0),len=Math.hypot(dx,dy)||1;const moveX=dx/len*speed*dt,moveY=dy/len*speed*dt,steps=Math.max(1,Math.ceil(Math.hypot(moveX,moveY)/5));for(let step=0;step<steps;step++){const nextX=player.x+moveX/steps,nextY=player.y+moveY/steps;if(canMove(nextX,player.y,7))player.x=nextX;if(canMove(player.x,nextY,7))player.y=nextY}if(dx||dy)player.a=Math.atan2(dx,-dy);if(keys.has(' ')&&Math.random()<dt*3){for(const p of police)if(dist(p,player)<60){p.hp-=25;player.wanted=Math.max(2,player.wanted);player.heat=40;sparks.push({x:p.x,y:p.y,life:.5})}}}
player.x=clamp(player.x,-WORLD,WORLD);player.y=clamp(player.y,-WORLD,WORLD);
// Keep vehicle position synchronized with world bounds, preventing camera/vehicle divergence.
if(player.vehicle){player.vehicle.x=player.x;player.vehicle.y=player.y}
if(buildingCollision(player.x,player.y,player.vehicle?12:7)){
 if(player.vehicle){const c=player.vehicle;c.x=oldX;c.y=oldY;if(Math.abs(c.s)>95){hit(Math.min(24,Math.abs(c.s)*.055));sparks.push({x:oldX,y:oldY,life:.5})}c.s*=-.22}
 player.x=oldX;player.y=oldY;
}
if(player.vehicle){player.vehicle.x=player.x;player.vehicle.y=player.y}
for(const c of cars){if(!c.ai||dist(c,player)>950)continue;c.phase+=dt;c.s=clamp(c.s+dt*80,0,105);c.x+=Math.sin(c.a)*c.s*dt;c.y-=Math.cos(c.a)*c.s*dt;
if(Math.abs(c.x)>WORLD||Math.abs(c.y)>WORLD){c.x=clamp(-c.x,-WORLD,WORLD);c.y=clamp(-c.y,-WORLD,WORLD);c.a+=Math.PI}
if(Math.abs(((c.x+TILE/2)%TILE+TILE)%TILE-TILE/2)<4&&Math.abs(((c.y+TILE/2)%TILE+TILE)%TILE-TILE/2)<4&&Math.random()<.15){c.a+=Math.random()<.5?Math.PI/2:-Math.PI/2}
if(dist(c,player)<22&&player.vehicle&&Math.abs(player.vehicle.s)>80){hit(10);player.wanted=Math.max(1,player.wanted);player.heat=30}}
for(const p of people){if(dist(p,player)>800)continue;const d=Math.hypot(p.tx-p.x,p.ty-p.y);if(d<8){p.tx=p.x+rnd(-100,100);p.ty=p.y+rnd(-100,100)}else{p.x+=(p.tx-p.x)/d*p.speed*dt;p.y+=(p.ty-p.y)/d*p.speed*dt}if(player.vehicle&&Math.abs(player.vehicle.s)>70&&dist(p,player)<18){player.wanted=Math.max(2,player.wanted);player.heat=55;p.x+=rnd(-60,60);p.y+=rnd(-60,60)}}
if(player.wanted>0){player.heat-=dt;if(player.heat<=0){player.wanted--;player.heat=18;notify(player.wanted?'HEAT FADING':'WANTED LEVEL CLEARED')}const desired=Math.min(2+player.wanted*2,10);while(police.length<desired){const a=rnd(-Math.PI,Math.PI);police.push({x:player.x+Math.cos(a)*rnd(500,700),y:player.y+Math.sin(a)*rnd(500,700),hp:100,a:0})}}
else police.length=0;
for(let i=police.length-1;i>=0;i--){const p=police[i];if(p.hp<=0){police.splice(i,1);continue}const d=dist(p,player);p.a=Math.atan2(player.x-p.x,-(player.y-p.y));if(d>30){p.x+=Math.sin(p.a)*Math.min(150+player.wanted*20,d)*dt;p.y-=Math.cos(p.a)*Math.min(150+player.wanted*20,d)*dt}else hit(14)}
const m=missions[mission%missions.length];if(m.type==='drive'&&player.vehicle&&dist(player,m)<90)advance();if(m.type==='reach'&&dist(player,m)<90)advance();if(m.type==='deliver'&&player.vehicle&&dist(player,m)<90)advance();if(m.type==='escape'){if(player.wanted>0)missionProgress=1;if(missionProgress===1&&player.wanted===0)advance();}if(m.type==='survive'){player.wanted=Math.max(player.wanted,3);player.heat=20;missionTimer+=dt;if(missionTimer>=45){player.wanted=0;advance()}}
for(let i=sparks.length-1;i>=0;i--){sparks[i].life-=dt;if(sparks[i].life<=0)sparks.splice(i,1)}
camera.x+=(player.x-camera.x)*Math.min(1,dt*5);camera.y+=(player.y-camera.y)*Math.min(1,dt*5);
saveTimer+=dt;if(saveTimer>20){saveTimer=0;save()}
$('cash').textContent='$ '+Math.floor(player.money).toLocaleString();$('wanted').textContent='★'.repeat(player.wanted)+'☆'.repeat(5-player.wanted);$('wanted').style.color=player.wanted?'#ffae62':'#b9c9d8';
$('mission').textContent=m.text+(m.type==='escape'&&!missionProgress?'  ·  ATTRACT POLICE ATTENTION FIRST':'')+'  ·  REWARD $'+m.reward;$('healthFill').style.width=clamp(player.hp,0,100)+'%';$('status').textContent='HEALTH · '+Math.ceil(player.hp)+(player.vehicle?'   |   SPEED '+Math.floor(Math.abs(player.vehicle.s)/4):'   |   ON FOOT');
if(clock>toastUntil)$('toast').style.opacity=0}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function draw(){ctx.fillStyle='#142c34';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W/2-camera.x,H/2-camera.y);
const left=Math.floor((camera.x-W/2)/TILE)-1,right=Math.ceil((camera.x+W/2)/TILE)+1,top=Math.floor((camera.y-H/2)/TILE)-1,bottom=Math.ceil((camera.y+H/2)/TILE)+1;
for(let i=left;i<=right;i++)for(let j=top;j<=bottom;j++){const x=i*TILE,y=j*TILE,seed=Math.abs((i*73856093^j*19349663)|0),hue=seed%4;
rect(x-TILE/2,y-TILE/2,TILE,TILE,'#1c363c');rect(x-84,y-84,168,168,['#254d55','#30434e','#394c55','#334b4b'][hue]);rect(x-74,y-74,148,148,['#2e5b63','#435a64','#56606c','#405b58'][hue]);
for(let k=0;k<4;k++){const bx=x-65+(k%2)*72,by=y-65+Math.floor(k/2)*72;rect(bx,by,62,62,['#213e50','#364555','#45536b','#2b4555'][(seed+k)%4]);rect(bx+5,by+5,52,5,'#688e9a');for(let a=0;a<3;a++)for(let b=0;b<3;b++)rect(bx+9+a*15,by+16+b*13,6,7,(seed+a+b+k)%3===0?'#f4ca86':'#416a79')}
}
for(let i=left;i<=right;i++){const x=i*TILE;rect(x-ROAD/2,camera.y-H,ROAD,H*2,'#26343d');rect(x-ROAD/2,camera.y-H,3,H*2,'#718b83');rect(x+ROAD/2-3,camera.y-H,3,H*2,'#718b83');for(let y=top*TILE-TILE;y<(bottom+2)*TILE;y+=34)rect(x-1,y,2,17,'#e7c77c')}
for(let j=top;j<=bottom;j++){const y=j*TILE;rect(camera.x-W,y-ROAD/2,W*2,ROAD,'#26343d');rect(camera.x-W,y-ROAD/2,W*2,3,'#718b83');rect(camera.x-W,y+ROAD/2-3,W*2,3,'#718b83');for(let x=left*TILE-TILE;x<(right+2)*TILE;x+=34)rect(x,y-1,17,2,'#e7c77c')}
for(let i=left;i<=right;i++)for(let j=top;j<=bottom;j++){const x=i*TILE,y=j*TILE;rect(x-ROAD/2,y-ROAD/2,ROAD,ROAD,'#26343d');for(let k=-1;k<=1;k++){rect(x-32,y-30+k*10,6,5,'#e4e0cc');rect(x+26,y-30+k*10,6,5,'#e4e0cc')}}
const m=missions[mission%missions.length];if(m.x!==undefined){ctx.strokeStyle='#ffc65a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(m.x,m.y,36+Math.sin(clock*3)*6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffd47e';ctx.font='bold 15px system-ui';ctx.fillText('OBJECTIVE',m.x-43,m.y-53)}
if(m.x!==undefined){const sx=m.x-camera.x+W/2,sy=m.y-camera.y+H/2;if(sx<55||sx>W-55||sy<55||sy>H-55){const angle=Math.atan2(sy-H/2,sx-W/2);const radius=Math.max(45,Math.min(W,H)/2-75);const px=clamp(W/2+Math.cos(angle)*radius,55,W-55),py=clamp(H/2+Math.sin(angle)*radius,55,H-55);ctx.save();ctx.translate(px-W/2+camera.x,py-H/2+camera.y);ctx.rotate(angle);ctx.fillStyle='#ffc65a';ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-10,-10);ctx.lineTo(-10,10);ctx.closePath();ctx.fill();ctx.restore()}}
for(const p of people){if(dist(p,camera)>Math.max(W,H))continue;ctx.fillStyle='#0b1b26';ctx.beginPath();ctx.ellipse(p.x+3,p.y+5,7,4,0,0,7);ctx.fill();ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,5,0,7);ctx.fill();ctx.fillStyle='#f7c6a4';ctx.beginPath();ctx.arc(p.x,p.y-4,3,0,7);ctx.fill()}
function vehicle(c,policeCar=false){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a);rect(-12,-23,24,46,policeCar?'#edf1f7':c.color);rect(-10,-13,20,13,'#132735');rect(-9,8,18,7,'#a7c4d3');rect(-10,-23,7,3,'#ffe5a2');rect(3,-23,7,3,'#ffe5a2');rect(-10,20,6,3,'#ff3c53');rect(4,20,6,3,'#ff3c53');if(policeCar){rect(-11,-4,22,5,Math.sin(clock*14)>0?'#f04a64':'#58baff')}ctx.restore()}
for(const c of cars)if(dist(c,camera)<Math.max(W,H))vehicle(c);for(const p of police)vehicle(p,true);
if(!player.vehicle){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.a);ctx.fillStyle='#080f17';ctx.beginPath();ctx.ellipse(3,5,9,6,0,0,7);ctx.fill();rect(-7,-10,14,18,'#f7b348');rect(-5,-15,10,8,'#e8b395');rect(-9,2,4,10,'#20283d');rect(5,2,4,10,'#20283d');ctx.restore()}
for(const s of sparks){ctx.globalAlpha=s.life*2;ctx.fillStyle='#ffc969';ctx.beginPath();ctx.arc(s.x,s.y,22*(1-s.life),0,7);ctx.fill();ctx.globalAlpha=1}
ctx.restore();drawMini()}
function drawMini(){mc.fillStyle='#0b1c29';mc.fillRect(0,0,190,190);mc.save();mc.translate(95-player.x*.065,95-player.y*.065);for(let i=-8;i<=8;i++){mc.fillStyle='#46525d';mc.fillRect(i*TILE*.065-2.4,-125,4.8,250);mc.fillRect(-125,i*TILE*.065-2.4,250,4.8)}const m=missions[mission%missions.length];if(m.x!==undefined){mc.fillStyle='#ffc65a';mc.beginPath();mc.arc(m.x*.065,m.y*.065,5,0,7);mc.fill()}for(const p of police){mc.fillStyle='#fc5066';mc.fillRect(p.x*.065-2,p.y*.065-2,4,4)}mc.restore();mc.fillStyle='#8ef8dc';mc.beginPath();mc.arc(95,95,4,0,7);mc.fill();mc.strokeStyle='#e5d4b0';mc.strokeRect(.5,.5,189,189)}
function frame(t){if(!playing){frameScheduled=false;return;}const dt=Math.min(.04,(t-last)/1000||0);last=t;if(!paused){update(dt);draw()}requestAnimationFrame(frame)}
})();
