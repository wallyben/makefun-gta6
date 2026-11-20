import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../game/index.html',import.meta.url),'utf8');
const root=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../game/game.js',import.meta.url),'utf8');
test('root launches complete game, not obsolete driving prototype',()=>{
 assert.match(root,/location\.replace\('\.\/game\/'\)/);
 assert.match(html,/id="world"/);
 assert.match(html,/id="start"/);
 assert.match(html,/id="resume"/);
 assert.match(html,/id="mini"/);
});
test('offline game contains full playable interaction and persistence hooks',()=>{
 for(const item of ['localStorage','requestAnimationFrame','interact()','drawMini()','function update(dt)','function draw()','function save()','function load()'])assert.ok(source.includes(item),item);
});
test('game boots in simulated browser and advances one frame without exceptions',()=>{
 const nodes=new Map();
 const ctx={setTransform(){},fillRect(){},save(){},restore(){},translate(){},rotate(){},beginPath(){},ellipse(){},arc(){},fill(){},stroke(){},fillText(){},strokeRect(){}};
 function element(id){if(!nodes.has(id))nodes.set(id,{id,style:{},textContent:'',hidden:false,onclick:null,getContext(){return ctx}});return nodes.get(id)}
 let raf=null;const listeners={};const store=new Map();
 const context={document:{getElementById:element,querySelectorAll(){return []},addEventListener(name,fn){listeners['document:'+name]=fn}},window:{innerWidth:1280,innerHeight:720,devicePixelRatio:1},addEventListener(name,fn){listeners[name]=fn},requestAnimationFrame(fn){raf=fn},performance:{now:()=>1000},localStorage:{setItem(k,v){store.set(k,v)},getItem(k){return store.get(k)||null}},Math,Set,JSON,Number,Date,console};
 vm.runInNewContext(source,context,{filename:'game.js',timeout:3000});
 assert.equal(typeof element('start').onclick,'function');
 element('start').onclick();
 assert.equal(element('menu').hidden,true);
 assert.equal(typeof raf,'function');
 raf(1016);
 assert.match(element('mission').textContent,/REWARD/);
 assert.match(element('status').textContent,/HEALTH/);
 listeners.keydown({key:'p',repeat:false,preventDefault(){}});
 assert.ok(store.has('neonCountySaveV1'));
});

test('script parses and contains no duplicate trailing game implementation',()=>{
 assert.doesNotThrow(()=>new vm.Script(source,{filename:'game/game.js'}));
 assert.equal((source.match(/\}\)\(\);/g)||[]).length,1,'expected exactly one IIFE terminator');
 assert.match(source.trimEnd(),/\}\)\(\);$/);
});
test('pause and resume prevent gameplay input while paused',()=>{
 const nodes=new Map();
 const ctx={setTransform(){},fillRect(){},save(){},restore(){},translate(){},rotate(){},beginPath(){},ellipse(){},arc(){},fill(){},stroke(){},fillText(){},strokeRect(){}};
 function element(id){if(!nodes.has(id))nodes.set(id,{style:{},textContent:'',hidden:false,getContext(){return ctx}});return nodes.get(id)}
 let raf;const listeners={};const storage=new Map();
 vm.runInNewContext(source,{document:{getElementById:element,querySelectorAll(){return []},addEventListener(name,fn){listeners['document:'+name]=fn}},window:{innerWidth:1000,innerHeight:700,devicePixelRatio:1},addEventListener:(n,f)=>listeners[n]=f,requestAnimationFrame:f=>raf=f,performance:{now:()=>1000},localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null},Math,Set,JSON,Number,Date,console},{timeout:3000});
 element('start').onclick();
 raf(1016);
 listeners.keydown({key:'Escape',repeat:false,preventDefault(){}});
 assert.equal(element('pause').hidden,false);
 listeners.keydown({key:'e',repeat:false,preventDefault(){}});
 assert.equal(element('pause').hidden,false);
 listeners.keydown({key:'Escape',repeat:false,preventDefault(){}});
 assert.equal(element('pause').hidden,true);
});
