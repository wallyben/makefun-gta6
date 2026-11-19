// Run with: node scripts/submission-preflight.mjs
// Local, read-only checks. This does not replace make.fun's official gate.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const failures=[],warnings=[];
const required=['LICENSE','main.ts','vendor/makefun-game.ts','game/index.html'];
for(const file of required)if(!existsSync(join(root,file)))failures.push('Missing required file: '+file);
const game=join(root,'game'),shots=join(root,'screenshots');
function walk(dir,base=''){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const rel=join(base,e.name),full=join(dir,e.name);return e.isDirectory()?[rel,...walk(full,rel)]:[rel]})}
const files=walk(game);
if(files.length>993)failures.push('game/ exceeds 993 files/directories');
let bytes=0;
for(const rel of files){const full=join(game,rel);if(Buffer.byteLength(rel,'utf8')>1000)failures.push('Overlong game path: '+rel);if(statSync(full).isFile())bytes+=statSync(full).size}
if(bytes>48*1024*1024)failures.push('game/ exceeds 48 MiB');
if(existsSync(join(game,'index.html'))){const html=readFileSync(join(game,'index.html'),'utf8');for(const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)){const ref=match[1];if(/^(?:https?:)?\/\//i.test(ref))failures.push('Network asset reference: '+ref);else if(!/^(?:data:|#)/.test(ref)&&!existsSync(join(game,ref.replace(/^\.\//,''))))failures.push('Missing referenced asset: '+ref)}}
const imageFiles=existsSync(shots)?readdirSync(shots).filter(n=>/\.(?:png|jpe?g)$/i.test(n)):[];
if(imageFiles.length<3||imageFiles.length>4)failures.push('Need 3 or 4 authentic PNG/JPEG screenshots (found '+imageFiles.length+')');
function dimensions(data){
 if(data.length>=24&&data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return [data.readUInt32BE(16),data.readUInt32BE(20)];
 if(data.length<4||data[0]!==0xff||data[1]!==0xd8)return null;
 let i=2;
 while(i+4<=data.length){
  if(data[i++]!==0xff)return null;
  while(i<data.length&&data[i]===0xff)i++;
  const marker=data[i++];
  if(marker===0xd9||marker===0xda)break;
  if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
  if(i+2>data.length)return null;
  const length=data.readUInt16BE(i);
  if(length<2||i+length>data.length)return null;
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
   if(length<7)return null;
   return [data.readUInt16BE(i+5),data.readUInt16BE(i+3)];
  }
  i+=length;
 }
 return null;
}
for(const name of imageFiles){
 const data=readFileSync(join(shots,name));
 if(data.length>256*1024)failures.push('Screenshot exceeds 256 KiB: '+name);
 const size=dimensions(data);
 if(!size)failures.push('Invalid or unsupported screenshot image: '+name);
 else if(size[0]<1||size[1]<1||size[0]>1280||size[1]>480)failures.push('Screenshot dimensions outside 1..1280 x 1..480: '+name);
}
warnings.push('Manual verification required: screenshots are genuine unedited browser captures');
warnings.push('Manual verification required: official unchanged vendor file, dossier reproducibility and witnessed sealed recordings');
warnings.push('Manual verification required: repository creation time, ownership, OSI license and browser playtest');
console.log(JSON.stringify({ready:failures.length===0,gameEntries:files.length,gameBytes:bytes,screenshots:imageFiles.length,failures,warnings},null,2));
if(failures.length)process.exitCode=1;
