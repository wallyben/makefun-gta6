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
for(const name of imageFiles){const data=readFileSync(join(shots,name));if(data.length>256*1024)failures.push('Screenshot exceeds 256 KiB: '+name);let width=0,height=0;if(data.subarray(1,4).toString()==='PNG'){width=data.readUInt32BE(16);height=data.readUInt32BE(20)}else warnings.push('JPEG dimensions not checked: '+name);if(width>1280||height>480)failures.push('Screenshot dimensions exceed 1280x480: '+name)}
warnings.push('Manual verification required: screenshots are genuine unedited browser captures');
warnings.push('Manual verification required: official unchanged vendor file, dossier reproducibility and witnessed sealed recordings');
warnings.push('Manual verification required: repository creation time, ownership, OSI license and browser playtest');
console.log(JSON.stringify({ready:failures.length===0,gameEntries:files.length,gameBytes:bytes,screenshots:imageFiles.length,failures,warnings},null,2));
if(failures.length)process.exitCode=1;
