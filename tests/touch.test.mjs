import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../game/game.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../game/index.html', import.meta.url), 'utf8');

test('touch controls match game bindings and are exposed in the interface', () => {
  for (const key of ['w','a','s','d','e',' ','shift','escape']) {
    assert.ok(html.includes('data-key="'+key+'"'), 'missing touch key '+JSON.stringify(key));
  }
  assert.match(html, /touch-action:none/);
});

test('multitouch keys release independently and pause blocks touch input', () => {
  const nodes = new Map(), listeners = {};
  const ctx = {setTransform(){},fillRect(){},save(){},restore(){},translate(){},rotate(){},beginPath(){},ellipse(){},arc(){},fill(){},stroke(){},fillText(){},strokeRect(){}};
  const buttons = ['w','a','s','d','e',' ','shift','escape'].map(key => ({
    dataset:{key}, handlers:{}, setPointerCapture(){},
    addEventListener(name,fn){this.handlers[name]=fn;}
  }));
  const element = id => {
    if (!nodes.has(id)) nodes.set(id,{style:{},hidden:false,textContent:'',getContext(){return ctx;}});
    return nodes.get(id);
  };
  let raf, now=1000;
  const context = {
    document:{getElementById:element,querySelectorAll(){return buttons;}},
    window:{innerWidth:1280,innerHeight:720,devicePixelRatio:1},
    addEventListener(name,fn){listeners[name]=fn;},
    requestAnimationFrame(fn){raf=fn;},
    performance:{now:()=>now},
    localStorage:{setItem(){},getItem(){return null;}},
    Math,Set,Map,JSON,Number,Date,console
  };
  vm.runInNewContext(source,context,{filename:'game.js',timeout:3000});
  element('start').onclick();
  const pointer=(key,type,id)=>buttons.find(b=>b.dataset.key===key).handlers[type]({pointerId:id,preventDefault(){}});
  pointer('w','pointerdown',1);
  pointer('d','pointerdown',2);
  now+=16;raf(now);
  assert.match(element('status').textContent,/HEALTH/);
  pointer('w','pointerup',1);
  pointer('d','pointerup',2);
  pointer('escape','pointerdown',3);
  assert.equal(element('pause').hidden,false);
  pointer('w','pointerdown',4);
  assert.equal(element('pause').hidden,false);
  pointer('escape','pointerdown',5);
  assert.equal(element('pause').hidden,true);
  pointer('w','pointercancel',4);
});
