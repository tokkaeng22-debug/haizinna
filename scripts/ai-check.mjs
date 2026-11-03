import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const fixture=JSON.parse(await fs.readFile('.data/test-fixtures/result.json','utf8'));
const base='http://127.0.0.1:4310';
async function post(url,body){const r=await fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();assert.ok(r.ok,JSON.stringify(j));return j;}
async function wait(id){let last='';for(let i=0;i<1800;i++){const r=await fetch(base+'/api/jobs/'+id),j=await r.json();const message=j.status+' '+Math.round(j.progress)+'%';if(message!==last){console.log(message);last=message;}if(j.status==='done')return j.result;if(j.status==='error')throw Error(j.message);await new Promise(r=>setTimeout(r,1000));}throw Error('AI job timed out');}
const task=await post('/api/separate',{mediaId:fixture.media.id});if(!task.cached)await wait(task.jobId);
for(const stem of ['vocals.wav','no_vocals.wav']){const r=await fetch(base+`/stems/${fixture.media.id}/${stem}`);assert.ok(r.ok);const b=Buffer.from(await r.arrayBuffer());assert.equal(b.subarray(0,4).toString(),'RIFF');assert.ok(b.length>10000);console.log('PASS '+stem+' '+b.length+' bytes');}
const cached=await post('/api/separate',{mediaId:fixture.media.id});assert.ok(cached.cached);console.log('PASS separation cache reused');
const p=JSON.parse(await fs.readFile('.data/test-fixtures/project.cutlocal','utf8'));p.clips[0].stems=true;p.clips[0].vocals=1;p.clips[0].music=0;p.clips[1].stems=true;p.clips[1].vocals=0;p.clips[1].music=1;
const output=await post('/api/export',p);await wait(output.jobId);console.log('PASS exported vocal-only and music-only clips');
