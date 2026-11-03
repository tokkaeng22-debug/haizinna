import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import probe from '@ffprobe-installer/ffprobe';
import assert from 'node:assert/strict';
import {emptyProject,makeClip,uid} from '../public/model.js';
const root=path.resolve('.data/test-fixtures');await fs.mkdir(root,{recursive:true});
function run(bin,args){return new Promise((resolve,reject)=>{const p=spawn(bin,args,{windowsHide:true});let text='';p.stdout.on('data',d=>text+=d);p.stderr.on('data',d=>text+=d);p.on('error',reject);p.on('close',c=>c?reject(Error(text)):resolve(text));});}
await run(ffmpeg,['-y','-v','error','-f','lavfi','-i','testsrc2=size=640x360:rate=30:duration=4','-f','lavfi','-i','sine=frequency=440:duration=4','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',path.join(root,'sample.mp4')]);
await run(ffmpeg,['-y','-v','error','-f','lavfi','-i','sine=frequency=220:duration=2','-c:a','pcm_s16le',path.join(root,'music.wav')]);
const base='http://127.0.0.1:4310';
async function request(url,body){const r=await fetch(base+url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});const json=await r.json();assert.ok(r.ok,JSON.stringify(json));return json;}
async function wait(id){for(let i=0;i<600;i++){const j=await request('/api/jobs/'+id);if(j.status==='done')return j.result;if(j.status==='error')throw Error(j.message);await new Promise(r=>setTimeout(r,500));}throw Error('Job timed out');}
async function upload(name){const r=await fetch(base+'/api/import',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent(name)},body:await fs.readFile(path.join(root,name))});const d=await r.json();assert.ok(r.ok,JSON.stringify(d));return wait(d.jobId);}
const m=await upload('sample.mp4'),music=await upload('music.wav');assert.ok(m.ready&&m.hasAudio);assert.equal(m.width,640);assert.ok((await (await fetch(base+`/media/${m.id}/wave.json`)).json()).length>0);console.log('PASS import, proxy, thumbnail and waveform');
const p=emptyProject();p.media=[m,music];const a=makeClip(m),b=makeClip(m);Object.assign(a,{out:1.5,scale:120,x:8,rotation:90,flip:true,volume:.6,fadeIn:.2,fadeOut:.2,sync:-.2});Object.assign(b,{in:1.5,out:3.5,speed:2,fit:'cover',sync:.2});p.clips=[a,b];p.tracks=[{id:uid(),mediaId:music.id,start:.25,offset:.7,duration:2.2,loop:true,volume:.25,mute:false,fadeIn:.1,fadeOut:.2}];
const job=await request('/api/export',p),result=await wait(job.jobId);assert.equal(result.width,640);assert.equal(result.height,360);assert.equal(result.duration,2.5);const output=path.resolve('.data/exports',job.jobId+'.mp4');const info=JSON.parse(await run(probe.path,['-v','error','-show_format','-show_streams','-of','json',output]));assert.ok(Math.abs(Number(info.format.duration)-2.5)<.15);assert.ok(info.streams.some(s=>s.codec_type==='audio'));assert.equal(info.streams.find(s=>s.codec_type==='video').width,640);console.log('PASS transformed, speed-adjusted, synchronized, faded and mixed MP4 export');
const bad=structuredClone(p);bad.clips[0].speed=0;assert.equal((await fetch(base+'/api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(bad)})).status,400);console.log('PASS invalid export rejected');
await fs.writeFile(path.join(root,'project.cutlocal'),JSON.stringify(p));await fs.writeFile(path.join(root,'result.json'),JSON.stringify({media:m,music,export:result,jobId:job.jobId},null,2));
