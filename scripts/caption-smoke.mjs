import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import probe from '@ffprobe-installer/ffprobe';
import {spawn} from 'node:child_process';
import {emptyProject,makeClip,uid} from '../public/model.js';

const root=path.resolve('.data/test-fixtures'),base='http://127.0.0.1:4310';
function run(bin,args){return new Promise((resolve,reject)=>{const p=spawn(bin,args,{windowsHide:true});let output='';p.stdout.on('data',d=>output+=d);p.stderr.on('data',d=>output+=d);p.on('error',reject);p.on('close',code=>code?reject(Error(output)):resolve(output));});}
async function request(url,body){const r=await fetch(base+url,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),json=await r.json();assert.ok(r.ok,JSON.stringify(json));return json;}
async function wait(id){let last='';for(let i=0;i<1800;i++){const j=await request('/api/jobs/'+id),state=`${j.status} ${Math.round(j.progress)}% ${j.message}`;if(state!==last){console.log(state);last=state;}if(j.status==='done')return j.result;if(j.status==='error')throw Error(j.message);await new Promise(r=>setTimeout(r,1000));}throw Error('Job timed out');}
async function upload(name){const r=await fetch(base+'/api/import',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent(name)},body:await fs.readFile(path.join(root,name))}),data=await r.json();assert.ok(r.ok,JSON.stringify(data));return wait(data.jobId);}

const status=await request('/api/status');assert.ok(status.ffmpeg&&status.ai&&status.captions);console.log('PASS caption engine installed');
const media=await upload('caption-voice.mp4');
const task=await request('/api/transcribe',{mediaId:media.id,language:'en',model:'tiny'}),result=task.cached?task:await wait(task.jobId),transcript=result.transcript;
assert.ok(transcript.segments.length>0,'No speech segments generated');
assert.match(transcript.segments.map(s=>s.text).join(' ').toLowerCase(),/local|subtitle|caption|video/);
console.log('PASS transcription:',transcript.segments.map(s=>s.text).join(' '));
const cached=await request('/api/transcribe',{mediaId:media.id,language:'en',model:'tiny'});assert.ok(cached.cached);console.log('PASS transcript cache reused');
const project=emptyProject(),clip=makeClip(media);project.media=[media];project.clips=[clip];project.name='Caption smoke test';project.subtitles=transcript.segments.map(s=>({id:uid(),start:s.start,end:Math.min(s.end,media.duration),text:s.text}));
const exportJob=await request('/api/export',project),exported=await wait(exportJob.jobId);assert.equal(exported.subtitles,project.subtitles.length);const output=path.resolve('.data/exports',exportJob.jobId+'.mp4');
const info=JSON.parse(await run(probe.path,['-v','error','-show_streams','-of','json',output]));assert.ok(info.streams.some(s=>s.codec_type==='video'));assert.ok(info.streams.some(s=>s.codec_type==='audio'));console.log('PASS captioned MP4 export:',output);
await fs.writeFile(path.join(root,'caption-result.json'),JSON.stringify({media,transcript,project,exported,output},null,2));
